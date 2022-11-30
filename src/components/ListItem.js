import React, { useState } from 'react'
import Icon from 'react-web-vector-icons'
import styles from '../styles/ListItem.module.css'
import CourseItem from './CourseItem';

const ListItem = ({ title, courses }) => {

    const [open, setOpen] = useState(false);

    const toggleOpen = () => {
        setOpen(!open);
    };

    return (
        <div className={styles.unselectable}>
            <div className={open ? styles.titlebar_active : styles.titlebar_unactive } onClick={toggleOpen}>
                <div className={styles.title}>{title}</div>
                <Icon 
                    name={open ? "chevron-up" : "chevron-down"} 
                    font="Feather" 
                    color='rgba(255, 255, 255, 0.8)' 
                    size={20}/>
            </div>
            <div className={open ? styles.courselist_open : styles.courselist_close}>
                { courses.map((course, idx) => <CourseItem 
                                                    key={idx} 
                                                    course={course} 
                                                    coreArea={title}/>) }
            </div>
        </div>
    )
}

export default ListItem;
