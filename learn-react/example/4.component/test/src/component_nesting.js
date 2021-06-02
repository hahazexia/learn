import React, { Component } from 'react'

// header
function Header () {
    return (
        <div>我是Header</div>
    )
}

// main
function Main () {
    return (
        <div>
            我是Main
            <Banner />
            <ProductList />
        </div>
    )
}

function Banner () {
    return (
        <h3>Banner</h3>
    )
}

function ProductList () {
    return (
        <ul>
            <li>商品1</li>
            <li>商品1</li>
            <li>商品1</li>
            <li>商品1</li>
            <li>商品1</li>
        </ul>
    )
}

// footer
function Footer () {
    return (
        <div>我是Footer</div>
    )
}

export default class App extends Component {
    render() {
        return (
            <div>
                App 组件
                <Header />
                <Main />
                <Footer />
            </div>
        )
    }
}
