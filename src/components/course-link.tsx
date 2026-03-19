import Link from "next/link"

export const CourseLink = ({ courseId, itemCount, videoId, createEntry } : any) => {
    return (
        <div>
        <a href={`/courses/${courseId}/${itemCount}/${videoId}`} onClick={createEntry}>Go to course</a>
        </div>
    )
}