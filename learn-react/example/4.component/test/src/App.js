import React, { Component } from 'react'
import TabControl from './TabControl'

export default class App extends Component {
    constructor () {
        super();
        this.state = {
            titles: ['新款', '精选', '流行'],
            currentIndex: 0
        };
    }
    render() {
        const { titles, currentIndex } = this.state;
        return (
            <div>
                <TabControl titles={titles} changeCurrentIndex={(index) => this.changeIndex(index)} />
                <h2>{titles[currentIndex]}</h2>
            </div>
        )
    }

    changeIndex (index) {
        this.setState({
            currentIndex: index
        })
    }
}
