// Copies the backend's OpenAPI spec into api-spec/openapi.json, which nswag.json generates
// src/apiClient/generated.ts from.
//
//   node scripts/update-api-spec.js                       # from ../TuneUp-App-Backend/openapi.json
//   node scripts/update-api-spec.js http://127.0.0.1:8001 # from a running backend
//
// The backend writes its openapi.json with `python scripts/export_openapi.py`.
const fs = require('fs');
const path = require('path');

const source = process.argv[2] || path.join(__dirname, '..', '..', 'TuneUp-App-Backend', 'openapi.json');
const target = path.join(__dirname, '..', 'api-spec', 'openapi.json');

async function load() {
    if (/^https?:\/\//.test(source)) {
        const url = source.endsWith('.json') ? source : source.replace(/\/$/, '') + '/openapi.json';
        const response = await fetch(url);
        if (!response.ok) throw new Error(`GET ${url} -> HTTP ${response.status}`);
        return response.json();
    }
    return JSON.parse(fs.readFileSync(source, 'utf8'));
}

// FastAPI emits OpenAPI 3.1, but NSwag only understands 3.0. Without this, optional fields
// (`anyOf: [T, {type: "null"}]` + `title`) become empty junk interfaces named after the title
// (including one called `Date` that shadows the built-in), and some properties are dropped.
function toOpenApi30(node, isComponentSchema = false, isProperty = false) {
    if (Array.isArray(node)) return node.map((item) => toOpenApi30(item));
    if (!node || typeof node !== 'object') return node;

    let out = {};
    for (const [key, value] of Object.entries(node)) {
        if (key === 'properties') {
            out.properties = Object.fromEntries(Object.entries(value).map(([name, schema]) => [name, toOpenApi30(schema, false, true)]));
        } else if (key === 'schemas' && !isComponentSchema) {
            out.schemas = Object.fromEntries(Object.entries(value).map(([name, schema]) => [name, toOpenApi30(schema, true)]));
        } else {
            out[key] = toOpenApi30(value);
        }
    }

    // anyOf: [T, {type: 'null'}]  ->  T + nullable
    if (Array.isArray(out.anyOf)) {
        const nonNull = out.anyOf.filter((schema) => schema.type !== 'null');
        if (nonNull.length === 1 && nonNull.length < out.anyOf.length) {
            const { anyOf, ...rest } = out;
            const inner = nonNull[0];
            out = inner.$ref ? { ...rest, allOf: [inner], nullable: true } : { ...rest, ...inner, nullable: true };
        }
    }
    // Property-level titles make NSwag emit a named type per property.
    if (isProperty) delete out.title;
    // Pydantic models never carry extra fields; without this every type gets `[key: string]: any`.
    if (isComponentSchema && out.type === 'object' && out.additionalProperties === undefined) {
        out.additionalProperties = false;
    }
    return out;
}

load()
    .then((spec) => {
        spec = toOpenApi30(spec);
        spec.openapi = '3.0.3';
        fs.mkdirSync(path.dirname(target), { recursive: true });
        fs.writeFileSync(target, JSON.stringify(spec, null, 2) + '\n');
        console.log(`Wrote ${path.relative(process.cwd(), target)} from ${source}`);
    })
    .catch((error) => {
        console.error(`Could not load OpenAPI spec from ${source}: ${error.message}`);
        process.exit(1);
    });
