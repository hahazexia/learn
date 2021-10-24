import React, { Component } from 'react'

export default class SetState extends Component {
    constructor(props) {
        super(props);
        this.state = {
            counter: 0,
            temp: 0
        };
    }

    componentDidMount() {
        this.changeValue(1);
        document.getElementById('test').addEventListener('click', () => this.changeValue(1))
    }

    // setState 在合成事件和生命周期中是异步的，其实是批量更新，为了性能优化。把多次 setState 合成一次
    changeValue(v) {
        this.setState({
            counter: this.state.counter + v
        }, () => {
            // callback 在 state 更新完成之后执行
            console.log(this.state.counter, 'callback counter')
        });
        console.log(this.state.counter, 'counter');
    }

    // setTimeout 和原生事件 中 setState 是同步的
    setCounter() {
        setTimeout(() => {
            this.changeValue(1);
        });
    }

    // setState 传递一个函数就可以实现链式调用。如果不用这种形式，那么 setState 多次调用修改同一个值，则只有最后一次起作用，将前面的调用都覆盖掉
    linkChangeValue(v) {
        this.setState((state) => {
            return {
                temp: state.temp + v
            }
        })
    }

    setTemp() {
        this.linkChangeValue(1);
        this.linkChangeValue(2);
        this.linkChangeValue(3);
    }

    render() {
        const { counter, temp } = this.state;
        return (
            <div>
                <div>setState</div>
                <button onClick={() => this.setCounter()}>{counter}</button>
                <div id="test">test</div>
                <div onClick={() => this.setTemp()}>{temp}</div>
            </div>
        )
    }
}
