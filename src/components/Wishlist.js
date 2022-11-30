import React, { useState, useEffect, useContext } from 'react'
import WishlistItem from './WishlistItem'
import Button from './Button'
import styles from '../styles/Wishlist.module.css'
import ToggleButton from './ToggleButton'
import PlannerContext from '../PlannerContext'

const Wishlist = ({ data, stats, setData, setStats, save, visible, toggleVisible }) => {
    const plannerContext = useContext(PlannerContext);

    const [refresh, setRefresh] = useState(false);
    const [isFilterVisible, setIsFilterVisible] = useState(false);
    const [filteredData, setFilteredData] = useState(data);

    // Filter states
    const [saActive, setSaActive] = useState(false);
    const [twActive, setTwActive] = useState(false);
    const [nmhActive, setNmhActive] = useState(false);
    const [nwActive, setNwActive] = useState(false);
    const [sifActive, setCifActive] = useState(false);

    const refreshWishlist = () => {
        setRefresh(!refresh);
    };

    // Retrieving saved wishlist data and stats
    useEffect(() => {
        const local_data = JSON.parse(localStorage.getItem("wishlistData"));
        const local_stats = JSON.parse(localStorage.getItem("wishlistStats"));
        if(local_data !== null && local_stats !== null) {
            setData(local_data);
            setStats(local_stats);
        }
    }, [ setData, setStats ]);

    const filterCourse = (courseCode) => {
        const inference = plannerContext.getInference(courseCode); // crn is an array
        // No filter condition
        if(!(saActive || twActive || nmhActive || nwActive || sifActive)) return true;

        if((saActive && inference === "Seats available")
            || (twActive && inference === "Try waitlisting")
            || (nmhActive && inference === "Not much hope")
            || (nwActive && inference === "No waitlist")
            || (sifActive && inference === "Section is full")
            || inference === "Fetching...") {
            return true;
        } else {
            return false;
        }
    };

    useEffect(() => {
        const newfilteredData = data.filter((course) => filterCourse(course.code));
        setFilteredData([...newfilteredData]);
    }, [ data, saActive, twActive, nmhActive, nwActive, sifActive ])

    return (
        <div className={visible ? styles.main : styles.hidden_main}>
            <div className={styles.header}>
                <h4 className={styles.title} onClick={toggleVisible}>Your Wishlist</h4>
                <Button text="Refresh" onClick={refreshWishlist}/>
                <div style={{ width: 15 }}/>
                <Button text="Save" onClick={save}/>
                <div style={{ flex: 1 }}/>
                <ToggleButton text="Filters" isActive={isFilterVisible} setActive={setIsFilterVisible} variant="primary"/>
                <div className={isFilterVisible ? styles.filters_panel : styles.filters_panel_hidden}>
                    <ToggleButton text="Seats available" isActive={saActive} setActive={setSaActive}/>
                    <ToggleButton text="Try waitlisting" isActive={twActive} setActive={setTwActive}/>
                    <ToggleButton text="Not much hope" isActive={nmhActive} setActive={setNmhActive}/>
                    <ToggleButton text="No waitlist" isActive={nwActive} setActive={setNwActive}/>
                    <ToggleButton text="Section is full" isActive={sifActive} setActive={setCifActive}/>
                </div>
            </div>
            <div className={styles.container}>
                {

                    filteredData.map((course) => {
                        return <WishlistItem 
                                    key={course.code}
                                    course={course}
                                    refresh={refresh}
                                    isVisible={true}/>
                    })
                }
                {
                    (plannerContext.wishlistData.length === 0 || filteredData.length === 0)
                    ?
                    <div className={styles.placeholder}>No courses to show here.</div>
                    :
                    <></>
                }
            </div>
        </div>
    )
}

export default Wishlist;
