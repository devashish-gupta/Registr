import React, { useState, useEffect, useRef } from 'react'
import Icon from 'react-web-vector-icons'
import styles from '../styles/TextInput.module.css'

const TextInput = ({ placeholder, updateText, width,
    margin, clear, setText, invalid, setInvalid }) => {

    const [isCrossVisible, setIsCrossVisible] = useState(false);

    // Method to clear the input field on request
    useEffect(() => {
        input.current.value = "";
    }, [clear]);

    // Local method for clearing the input field
    const clearInput = () => {
        if(setInvalid !== undefined) setInvalid({val: false, reason: ""});
        input.current.value = "";
        updateText("");
    }

    // Method for programmatically setting input field text
    useEffect(() => {
        if(setText != null) {
            input.current.value = setText;
        } else {
            input.current.value = "";
        }
    }, [setText]);

    const input = useRef();

    return (
        <div style={{ width: width + "px", marginLeft: margin.left + "px", paddingRight: margin.right + "px" }}>
            <div className={invalid ? styles.invalid_container : styles.container}>
                <input type="text"
                    placeholder={placeholder}
                    className={styles.search}
                    spellCheck="false"
                    onFocus={() => {setIsCrossVisible(true)}}
                    onBlur={() => {setIsCrossVisible(false)}}
                    onChange={(event) => {updateText(event.target.value)}}
                    ref={input}/>
                <div 
                    className={(isCrossVisible && input.current.value !== "") ? styles.visible_cross : styles.invisible_cross}
                    onClick={clearInput}>
                    <Icon name="x" font="Feather" size={20} color="rgba(255, 255, 255, 0.6)"/>
                </div>
            </div>
        </div>
    )
}

export default TextInput;
