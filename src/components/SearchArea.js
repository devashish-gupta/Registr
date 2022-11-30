import React, { useState } from 'react'
import Button from './Button'
import SearchBar from './SearchBar'
import CourseItem from './CourseItem'
import Tooltip from './Tooltip';
import styles from '../styles/SearchArea.module.css'

const SearchArea = ({ setIsDim, coreAreas, classifiedCourses }) => {

    const [searchText, setSearchText] = useState('');
    const [coreAreaDisplay, setcoreAreaDisplay] = useState("");
    const [isCrossVisible, setIsCrossVisible] = useState(false);
    const [allCourses, setAllCourses] = useState(classifiedCourses.flat())

    // Maintain consistency with state
    const updateSearchText = (event) => {
        const text = event.target.value;
        if(text.length > 0) {
            setIsDim(true);
            setIsCrossVisible(true);
        } else {
            setIsDim(false);
            setIsCrossVisible(false);
        }
        setSearchText(text);
    };

    const computeCoreAreaString = (course) => {
        for(let i = 0; i < coreAreas.length; i++) {
            for(let j = 0; j < classifiedCourses[i].length; j++) {
                if(course.name === classifiedCourses[i][j].name) {
                    return coreAreas[i];
                }
            }
        }
    }

    return (
        <div className={styles.container}>
            <h5 className={styles.title}>Course search</h5>
            <div className={styles.inputarea}>
                <div className={styles.searchbar}>
                    <SearchBar 
                        onChange={updateSearchText}
                        crossVisible={isCrossVisible}
                        setIsCrossVisible={setIsCrossVisible}
                        setIsDim={setIsDim}
                        setSearchText={setSearchText}/>
                </div>
                <div className={styles.searchbutton}>
                    <Button text="Search" onClick={() => {}}/>
                </div>
            </div>
            <div className={styles.searchresults}>
                { 
                    (searchText.length > 0)
                    ?
                    allCourses.filter((item) => {
                        const searchTerm = searchText.toLowerCase();
                        const name = item.name.toLowerCase();
                        const code = item.code.toLowerCase();
                        
                        return ((name.includes(searchTerm) || code.includes(searchTerm))
                                    && searchText)
                    })
                    .map((item, idx) => { 
                        const coreArea = computeCoreAreaString(item);
                        return <CourseItem 
                                    course={item} 
                                    key={item.code} 
                                    coreArea={coreArea}
                                    setCoreArea={setcoreAreaDisplay}
                                    search={true}/> })
                    .slice(0,6)
                    :
                    <></>
                }
                <Tooltip visible={(coreAreaDisplay !== "")} title={coreAreaDisplay}/> 
            </div>
        </div>
    )
}

export default SearchArea;
