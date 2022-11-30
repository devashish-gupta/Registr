import React from 'react'
import styles from '../styles/ToggleButton.module.css'

const ToggleButton = ({ text, isActive, setActive, variant }) => {

    if(variant === "primary") {
        return (
            <button className={isActive ? styles.primary_active_button : styles.active_button} 
                onClick={() => {setActive(!isActive)}}>
                {text}
            </button>
        )
    } else {
        return (
            <button className={isActive ? styles.active_button : styles.button} 
                onClick={() => {setActive(!isActive)}}>
                {text}
            </button>
        )
    }
}

export default ToggleButton;
