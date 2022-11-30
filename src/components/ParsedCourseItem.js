import React, { useState, useRef, useEffect } from 'react'
import PlannerContext from '../PlannerContext'
import styles from '../styles/ParsedCourseItem.module.css'
import RoundButton from './RoundButton'

const ParsedCourseItem = ({ course, selected, renameActive,
    setRenameActive, updateName, classified, disabled, onClick }) => {
    // A ParsedCourseItem may be classified or unclassified
    // const [addedToCoreArea, setAddedToCoreArea] = useState(false);
    const [isFoundational, setIsFoundational] = useState(false);

    const input = useRef();

    // handling course rename commit
    const handleCommit = (event) => {
        if(event.key === "Enter") {
            setRenameActive(false);
            if(input.current.value !== "") {
                updateName(input.current.value);
            }
        } else if(event.key === "Escape" || event.key === "q") {
            setRenameActive(false);
        }
    };

    // Determine if the course if foundational
    useEffect(() => {
        if(course.code.slice(-1)[0] === "*") {
            setIsFoundational(true);
        } else {
            setIsFoundational(false);
        }
    }, [ course.code ]);

    return (
        (selected)
        ?
        <div className={isFoundational ? styles.sel_foundational_container : styles.sel_container}>

            <div className={styles.code}>{course.code}</div>
            {
                (renameActive && selected)
                ?
                <input autoFocus type="text" className={styles.input} onKeyDown={handleCommit} ref={input} defaultValue={course.name} spellCheck={false}/>
                :
                <div className={styles.name}>{course.name}</div>
            }
            <RoundButton 
                name={classified ? "minus" : "plus"} 
                onClick={onClick}
                variant={5}
                tooltip={
                    classified 
                    ? 
                        (disabled)
                        ?
                        "Add/select a core area first" 
                        : 
                        "Remove"
                    :
                        (disabled)
                        ?
                        "Add/select a core area first" 
                        : 
                        "Add"
                }
                disabled={disabled}/>
        </div>
        :
        <div className={isFoundational ? styles.foundational_container : styles.container}>

            <div className={styles.code}>{course.code}</div>
            {
                (renameActive && selected)
                ?
                <input autoFocus type="text" className={styles.input} onKeyDown={handleCommit} ref={input} defaultValue={course.name} spellCheck={false}/>
                :
                <div className={styles.name}>{course.name}</div>
            }

            <RoundButton 
                name={classified ? "minus" : "plus"} 
                onClick={onClick}
                variant={5}
                tooltip={
                    classified 
                    ? 
                        (disabled)
                        ?
                        "Add/select a core area first" 
                        : 
                        "Remove"
                    :
                        (disabled)
                        ?
                        "Add/select a core area first" 
                        : 
                        "Add"
                }
                disabled={disabled}/>
        </div>
    )
}

export default ParsedCourseItem;
