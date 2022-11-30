import React from 'react'
import styles from '../styles/Button.module.css'

const Button = ({ text, onClick, secondary, disabled, tooltip, disabledTooltip, style }) => {
    if(!disabled) {
        return (
            <button className={(secondary == null) 
                ? styles.button 
                : styles.secondary_button} 
                onClick={onClick}
                title={tooltip}
                style={style}>
                {text}
            </button>
        )
    } else {
        return (
            <button className={(secondary == null) 
                ? styles.button_disabled 
                : styles.secondary_button_disabled} 
                onClick={onClick}
                title={(disabledTooltip !== null) ? disabledTooltip : tooltip}
                style={style}>
                {text}
            </button>
        )
    }
}

export default Button;
