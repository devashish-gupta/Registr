import React, { useState, useContext, useEffect } from 'react'
import PlannerContext from '../PlannerContext'
import styles from '../styles/CourseItem.module.css'
import RoundButton from './RoundButton'

const CourseItem = ({ course, coreArea, setCoreArea, search }) => {

    const [addedToWishlist, setAddedToWishlist] = useState(false);
    const [isFoundational, setIsFoundational] = useState(false);
    const [isNotOffered, setIsNotOffered] = useState(false); // Course offered by default

    const plannerContext = useContext(PlannerContext);

    useEffect(() => {
        // Check if course in in wishlist
        if(plannerContext.wishlistData.some(item => item.name === course.name)) {
            setAddedToWishlist(true);
        } else {
            setAddedToWishlist(false);
        }

        // Check if course is foundational
        if(course.code.slice(-1)[0] === "*") {
            setIsFoundational(true);
        }

        // Check if the course is offered
        if(course.crn === 0) {
            setIsNotOffered(true);
        }
    }, [ plannerContext.wishlistData, course ]);

    const addToWishlist = () => {
        setAddedToWishlist(false);
        plannerContext.setWishlistData([...plannerContext.wishlistData, course]);
        plannerContext.setWishlistStats([...plannerContext.wishlistStats, {
            crn: course.crn[0],
            code: course.code,
            inference: "",
            cap_num: 0,
            cap_den: 0,
            wait_num: 0,
            wait_den: 0,
            registered: false
        }]);     
    };

    const removeFromWishlist = () => {
        setAddedToWishlist(true);
        plannerContext.setWishlistData(plannerContext.wishlistData.filter(
            (item) => item.name !== course.name
        ));
        plannerContext.setWishlistStats(plannerContext.wishlistStats.filter(
            (item) => !course.crn.includes(item.crn)
        ));
    };

    if(search) {
        return (
            <div className={isFoundational ? styles.foundational_container : styles.container}
                onMouseOver={() => {setCoreArea(coreArea)}}
                onMouseOut={() => {setCoreArea("")}}>

                <div className={styles.code}>{course.code}</div>
                <div className={styles.name}>{course.name}</div>

                <RoundButton 
                    name={addedToWishlist ? "minus" : "plus"} 
                    onClick={addedToWishlist ? removeFromWishlist : addToWishlist}
                    variant={5}
                    tooltip={addedToWishlist ? "Remove" : "Add"}
                    disabled={isNotOffered}/>
            </div>
        )
    } else {
        return (
            <div className={isFoundational ? styles.foundational_container : styles.container}>

                <div className={styles.code}>{course.code}</div>
                <div className={styles.name}>{course.name}</div>

                <RoundButton 
                    name={addedToWishlist ? "minus" : "plus"} 
                    onClick={addedToWishlist ? removeFromWishlist : addToWishlist}
                    variant={5}
                    tooltip={addedToWishlist ? "Remove" : "Add"}
                    disabled={isNotOffered}/>
            </div>
        )
    }
}

export default CourseItem;
