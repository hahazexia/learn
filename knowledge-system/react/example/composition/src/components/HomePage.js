import React, { Component } from 'react'
import Layout from './Layout'

export default class HomePage extends Component {
    render() {
        return (
            <div>
                <Layout showTopBar={false} showBottomBar={true}>
                    {
                        {
                            content: 'HomePage',
                            txt: '文字',
                            btnClick: () => console.log('点击按钮')
                        }
                    }
                </Layout>
            </div>
        )
    }
}
