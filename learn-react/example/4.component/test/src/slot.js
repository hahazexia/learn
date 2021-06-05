import React, { Component } from 'react'

export default class Slot extends Component {
    render() {
        const { leftSlot, centerSlot, rightSlot } = this.props;
        return (
            <div className="slot">
                <div className="left">{leftSlot}</div>
                <div className="center">{centerSlot}</div>
                <div className="right">{rightSlot}</div>
            </div>
        )
    }
}
