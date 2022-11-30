import React from 'react'
import styles from '../styles/Tooltip.module.css'

const Tooltip = ({ title, visible }) => {
    return (
        <div className={visible ? styles.visiblecontainer : styles.invisiblecontainer}>
            {title}
        </div>
    )
}

export default Tooltip;
