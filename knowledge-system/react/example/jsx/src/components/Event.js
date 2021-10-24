import React, { Component } from 'react'

export default class Event extends Component {

    btnClick() {
        console.log('btnClick');
    }
    increment = () => {
        console.log('increment');
    }
    decrement() {
        console.log('decrement');
    }
    render() {
        return (
            <div>
                {/* 1.方案一: bind绑定this(显示绑定) */}
                <button onClick={this.btnClick.bind(this)}>按钮1</button>
                <button onClick={this.btnClick.bind(this)}>按钮2</button>
                <button onClick={this.btnClick.bind(this)}>按钮3</button>

                {/* 2.方案二: 定义函数时, 使用箭头函数 */}
                <button onClick={this.increment}>+1</button>

                {/* 2.方案三(推荐): 直接传入一个箭头函数, 在箭头函数中调用需要执行的函数*/}
                <button onClick={() => { this.decrement(666) }}>-1</button>
            </div>
        )
    }
}
