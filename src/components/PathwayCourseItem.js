import React, { useState, useContext } from 'react'
import RoundButton from './RoundButton';
import PlannerContext from '../PlannerContext'
import styles from '../styles/PathwayCourseItem.module.css'

const PathwayCourseItem = ({ course, pathway, refresh }) => {
    const [isFoundational, setIsFoundational] = useState(false);
    const [isRegistered, setIsRegistered] = useState(false); // Course not registered for by default
    const [isHovered, setIsHovered] = useState(false);

    const plannerContext = useContext(PlannerContext);

    const addCourseToPathway = () => {
        const idx = plannerContext.pathwaysData.findIndex(pathwayItem => pathwayItem.name === pathway.name);
        const newPathwaysData = plannerContext.pathwaysData;
        newPathwaysData[idx].courses = [...newPathwaysData[idx].courses, course];
        plannerContext.setPathwaysData(newPathwaysData);
        refresh();
    };

    return (
        <div className={styles.unselectable}>
            <div className={
                isFoundational 
                ? (isRegistered 
                    ? styles.foundational_registered_container 
                    : styles.foundational_container) 
                : (isRegistered 
                    ? styles.registered_container 
                    : styles.container)}
                onMouseOver={() => {setIsHovered(true)}}
                onMouseOut={() => {setIsHovered(false)}}>

                <div className={styles.code}>{course.code}</div>
                <div className={styles.name}>{course.name}</div>
                <div style={{ flex: 1 }}/>
                
                {isHovered
                    ?
                    <RoundButton 
                        name="plus" 
                        onClick={addCourseToPathway}
                        variant={5}
                        tooltip="Add"/>
                    :
                    <div className={styles.placeholder}></div>
                }
            </div>
        </div>
    )
}

export default PathwayCourseItem;
