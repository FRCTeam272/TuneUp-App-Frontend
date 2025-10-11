import { useState } from "react";

export default function  useInput(defaultValue) {
    const [value, setValue] = useState(defaultValue != null ? defaultValue: "");
    function onChange(e) {
        if(typeof(value) == 'boolean'){
            let temp = !value
            setValue(temp);
            return;
        }
        if(e && e.target){
            setValue(e.target.value);
        } else {
            setValue(e)
        }
    }
    return {
      value,
      onChange,
    };
}