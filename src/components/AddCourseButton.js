import React, { useState, useContext } from 'react'
import styles from '../styles/AddCourseButton.module.css'

const AddCourseButton = ({ toggleCourseList }) => {

    return (
        <div className={styles.unselectable}
            onClick={toggleCourseList}>
            <div className={styles.container}>
                <div className={styles.text}>Add a course</div>
            </div>
        </div>
    )
}

export default AddCourseButton;
