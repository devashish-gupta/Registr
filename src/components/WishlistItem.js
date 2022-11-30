import React, { useState, useEffect, useContext } from 'react'
import styles from '../styles/WishlistItem.module.css'
import ProgressBar from './ProgressBar'
import RoundButton from './RoundButton';
import Dropdown from './Dropdown'
import PlannerContext from '../PlannerContext'
import GlobalContext from '../GlobalContext'

const WishlistItem = ({ course, refresh, isVisible }) => {

    const plannerContext = useContext(PlannerContext);
    const globalContext = useContext(GlobalContext);

    const [inference, setInference] = useState("Fetching...");
    const [showCopied, setShowCopied] = useState(false);
    const [isRegistered, setIsRegistered] = useState(false);
    const [selectedSection, setSelectedSection] = useState(0);
    const [prevSelectedSection, setPrevSelectedSection] = useState(0);

    // Stats
    const [cap_den, setcap_den] = useState(0);
    const [cap_num, setcap_num] = useState(0);
    const [wait_den, setwait_den] = useState(0);
    const [wait_num, setwait_num] = useState(0);

    useEffect(() => {
        // Course not offered this semester
        if(course.crn[selectedSection] === 0) return;
        setInference("Fetching...");

        // Fetching data here
        // url: https://oscar.gatech.edu/bprod/bwckschd.p_disp_detail_sched?term_in=202208&crn_in=<crn>
        
        var sem;
        switch(globalContext.currentPlan.semester) {
            case "Fall": sem = "08"; break;
            case "Spring": sem = "02"; break;
            case "Summer": sem =  "05"; break;
            default: break;
        }

        const url = "/bprod/bwckschd.p_disp_detail_sched?term_in=" 
            + globalContext.currentPlan.year + sem + "&crn_in=" + course.crn[selectedSection];

        const headers = new Headers({
            "Accept"       : "application/json",
            "Content-Type" : "application/json",
            "User-Agent"   : "Google Chrome: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36",
            "Access-Control-Allow-Origin": "*"
        });
        fetch(url, {
            method: 'GET',
            headers: headers
        })
        .then(res => res.text())
        .then(text => {
            var parser = new DOMParser();
            var html = parser.parseFromString(text, 'text/html');
        
            const cap_den = parseInt(html.querySelector("body > div.pagebodydiv > table:nth-child(2) > tbody > tr:nth-child(2) > td > table > tbody > tr:nth-child(2) > td:nth-child(2)").innerHTML);
            const cap_num = parseInt(html.querySelector("body > div.pagebodydiv > table:nth-child(2) > tbody > tr:nth-child(2) > td > table > tbody > tr:nth-child(2) > td:nth-child(3)").innerHTML);
            const wait_den = parseInt(html.querySelector("body > div.pagebodydiv > table:nth-child(2) > tbody > tr:nth-child(2) > td > table > tbody > tr:nth-child(3) > td:nth-child(2)").innerHTML);
            const wait_num = parseInt(html.querySelector("body > div.pagebodydiv > table:nth-child(2) > tbody > tr:nth-child(2) > td > table > tbody > tr:nth-child(3) > td:nth-child(3)").innerHTML);
            
            if(cap_num < cap_den && wait_num === 0) {
                setInference("Seats available");
            } else if(wait_num > 0) {       
                if(wait_num / wait_den >= 0.8) {
                    setInference("Not much hope");
                } else if(wait_den === 0) {
                    setInference("No waitlist");
                } else {
                    setInference("Try waitlisting");
                }
            } else {
                setInference("Section is full");
            }

            // Updating stats
            setcap_den(cap_den);
            setcap_num(cap_num);
            setwait_den(wait_den);
            setwait_num(wait_num);
            // syncStats(course.crn[selectedSection], course.crn[selectedSection]);
        });

    }, [ refresh, course, selectedSection, 
        globalContext.currentPlan.semester,
        globalContext.currentPlan.year ]);

    useEffect(() => {
        // Updating stats globally
        plannerContext.setStats({code: course.code, stats: { // crn in wishlist stats hasn't been updated yet
            crn: course.crn[selectedSection],
            code: course.code,
            inference: inference,
            cap_num: cap_num,
            cap_den: cap_den,
            wait_num: wait_num,
            wait_den: wait_den,
            registered: isRegistered
        }});

    }, [ cap_num, cap_den, wait_num, wait_den, 
        inference, isRegistered, selectedSection ]);

    const syncStats = (courseCode) => {
        plannerContext.setStats({code: courseCode, stats: { // crn in wishlist stats hasn't been updated yet
            crn: course.crn[selectedSection],
            code: course.code,
            inference: inference,
            cap_num: cap_num,
            cap_den: cap_den,
            wait_num: wait_num,
            wait_den: wait_den,
            registered: isRegistered
        }});
    }

    const removeFromWishlist = () => {
        plannerContext.setWishlistData(plannerContext.wishlistData.filter(
            (item) => item.name !== course.name
        ));
        plannerContext.setWishlistStats(plannerContext.wishlistStats.filter(
            (item) => !course.crn.includes(item.crn)
        ));
        
    };

    const copyCRN = () => {
        navigator.clipboard.writeText(course.crn[selectedSection]);
        setShowCopied(true);
        setTimeout(() => {
            setShowCopied(false);
        }, 1000);
        console.log(plannerContext.wishlistStats)
    };

    const toggleCRN = () => {
        setPrevSelectedSection(selectedSection);
        setSelectedSection((selectedSection + 1) % course.crn.length);
    }

    const registerCourse = () => {
        setIsRegistered(true);
    };

    const unregisterCourse = () => {
        setIsRegistered(false);
        syncStats(course.crn[selectedSection], course.crn[selectedSection]);
    };

    if(isVisible) {
        return (
            <div className={styles.container}>
                <div className={styles.details}>
                    <div className={styles.title} onClick={copyCRN} title="Copy CRN">
                        {course.name}
                    </div>
                    <div className={styles.smalldetails}>
                        <div>{(course.crn.length > 1) ? course.crn.length + "  SECTIONS" : course.crn.length + " " + " SECTION"}</div>
                        <div style={{ fontSize: 18, marginTop: -5, opacity: 0.5 }}> &#9656;</div>
                        <div className={styles.crn} onClick={toggleCRN} title="Toggle through sections">{"CRN " + course.crn[selectedSection]}</div>
                        <div className={styles.code}>{course.code}</div>
                        <div className={styles.credits}>{(course.credits !== 1) ? course.credits + " CREDITS" : course.credits + " CREDIT"}</div>
                        <div className={showCopied ? styles.show_copied : styles.hide_copied}>CRN Copied!</div>
                    </div>
                </div>
                <div className={styles.stats}>
                    <div className={styles.statcontainer}>
                        <ProgressBar text="Capacity" num={cap_num} den={cap_den}/>
                        <ProgressBar text="Waitlist" num={wait_num} den={wait_den}/>
                    </div>
                </div>
                <div className={styles.actions}>
                    <div className={styles.actioncontainer}>
                        <div className={styles.inference}>{inference}</div>
                        <div className={styles.actionbuttons}>
                            <div style={{ flex: 1 }}/>
                            <div style={{ marginRight: 8 }}>
                                <RoundButton 
                                    name="minus" 
                                    onClick={removeFromWishlist} 
                                    tooltip="Remove"
                                    variant={2}/>
                            </div>
                            <div style={{ marginRight: 8 }}>
                                <RoundButton 
                                    name={isRegistered ? "check-square" : "square"} 
                                    onClick={isRegistered ? unregisterCourse : registerCourse} 
                                    variant={2}
                                    tooltip={isRegistered ? "Mark unregistered" : "Mark registered"}/>
                            </div>            
                            <RoundButton name="arrow-up-right" 
                                onClick={() => { 
                                    var sem;
                                    switch(globalContext.currentPlan.semester) {
                                        case "Fall": sem = "08"; break;
                                        case "Spring": sem = "02"; break;
                                        case "Summer": sem =  "05"; break;
                                        default: break;
                                    }
                                    window.open("https://oscar.gatech.edu/bprod/bwckschd.p_disp_detail_sched?term_in=" 
                                        + globalContext.currentPlan.year + sem 
                                        + "&crn_in=" + course.crn[selectedSection], "_blank") 
                                }} 
                                tooltip="Visit"
                                variant={2}/>
                        </div>
                    </div>
                </div>
            </div>
        )
    } else {
        return <></>
    }
}

export default WishlistItem;
