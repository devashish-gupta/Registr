import styles from '../styles/CoreAreaItem.module.css'
import { useRef } from 'react'

const CoreAreaItem = ({ name, selected, onClick, renameActive,
    setRenameActive, updateName }) => {

    const input = useRef();

    // handling core area rename commit
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

    return (
        (renameActive && selected)
        ?
        <div className={selected ? styles.sel_container : styles.container} onClick={onClick}>
            <input autoFocus type="text" className={styles.input} onKeyDown={handleCommit} ref={input} defaultValue={name} spellCheck={false}/>
        </div>
        :
        <div className={selected ? styles.sel_container : styles.container} onClick={onClick}>
            { (name.length > 25) ? name.slice(0, 25) + "..." : name }
        </div>
    )
}

export default CoreAreaItem;
