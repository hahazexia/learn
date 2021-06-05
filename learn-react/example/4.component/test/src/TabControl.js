import React, { Component } from 'react'
import PropTypes from 'prop-types';

export default class TabControl extends Component {
    constructor(props) {
        super(props);
        this.state = {
            currentIndex: 0
        }
    }
    render() {
        const { titles } = this.props;
        const { currentIndex } = this.state;
        return (
            <div className="tab-control">
                {
                    titles.map((item, index) => (
                        <div 
                        className={`tab-item ${currentIndex === index ? 'active' : ''}`}
                        key={index}
                        onClick={e => this.changeCurrent(index)}>
                            <span>{item}</span>
                        </div>
                    ))
                }
            </div>
        )
    }

    changeCurrent (index) {
        this.setState({
            currentIndex: index
        });

        const { changeCurrentIndex } = this.props;
        changeCurrentIndex(index);
    }
}


TabControl.propTypes = {
    titles: PropTypes.array.isRequired
}