import { useState, type ChangeEvent } from "react";

type InputElement = HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;

/** State for a text input; spread the result onto the input: <Form.Control {...input} />. */
export default function useInput(defaultValue: string | number | null = "") {
    const [value, setValue] = useState(defaultValue != null ? String(defaultValue) : "");
    function onChange(e: ChangeEvent<InputElement> | string) {
        setValue(typeof e === "string" ? e : e.target.value);
    }
    return {
        value,
        onChange,
    };
}
