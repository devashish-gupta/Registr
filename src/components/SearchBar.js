import React, { useRef } from 'react'
import Icon from 'react-web-vector-icons'
import styles from '../styles/SearchBar.module.css'

const SearchBar = ({ onChange, onFocus, onBlur, crossVisible, 
        setIsCrossVisible, setSearchText, setIsDim }) => {

    const inputField = useRef();

    const clearInput = () => {
        inputField.current.value = '';
        setSearchText('');
        setIsCrossVisible(false);
        setIsDim(false);
    };

    return (
        <div className={styles.container}>
            <input type="text"
                placeholder="Search for a course" 
                className={styles.search}
                spellCheck="false"
                onChange={onChange}
                onFocus={onFocus}
                onBlur={onBlur}
                ref={inputField}/>

            <div className={crossVisible ? styles.visible_cross : styles.invisible_cross}
                onClick={clearInput}>
                <Icon name="x" font="Feather" size={20} color="rgba(255, 255, 255, 0.6)"/>
            </div>
        </div>
    )
}

export default SearchBar;
