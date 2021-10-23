import React, { useState, useEffect } from 'react'

export default function FunctionComponent(props) {
    const [date, setDate] = useState(new Date());
    useEffect(() => {
        const timer = setInterval(() => {
            setDate(new Date());
        }, 1000);

        return () => clearInterval(timer);
    }, []);
    return (
        <div>
            <div>FunctionComponent</div>
            <div>{date.toLocaleString()}</div>
        </div>
    )
}
