import React, { useState, useEffect } from 'react'
import Icon from 'react-web-vector-icons'
import styles from '../styles/Dropdown.module.css'

const Dropdown = ({ options, def, setOption, width, clear }) => {

    const [isOpen, setIsOpen] = useState(false);
    const [currentIndex, setCurrentIndex] = useState(def)

    useEffect(() => {
        setCurrentIndex(def);
    }, [clear])

    return (
        <div style={{ width: width + "px" }}>
            <div className={styles.container}>
                <div className={styles.box} onClick={() => {setIsOpen(!isOpen)}}>
                    <div className={styles.current_option}>{options[currentIndex]}</div>
                    <div className={styles.icon}>
                        <Icon 
                            name={isOpen ? "chevron-up" : "chevron-down"} 
                            font="Feather" 
                            color='rgba(255, 255, 255, 0.8)' 
                            size={20}/>
                    </div>
                </div>
                <div style={{ width: width + "px" }}>
                    <div className={isOpen ? styles.options_open : styles.options_close}>
                        {
                            options.map((option, idx) => <div className={styles.option_item} 
                                onClick={() => {
                                    setCurrentIndex(idx); 
                                    setIsOpen(false); 
                                    setOption(idx)}} key={idx}>
                                        {option}
                                    </div>)
                        }
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Dropdown;
