import React, { useState } from 'react';
import { Card, List, Button, Toast, Avatar, Space, Divider, Tag, Modal, Dialog } from 'antd-mobile';
import {
    UserOutline,
    BellOutline,
    QuestionCircleOutline,
    RightOutline,
    SetOutline,
    UnorderedListOutline, UserContactOutline
} from 'antd-mobile-icons';
import { useAuth } from '../store/authStore.jsx';
import { useNavigate } from 'react-router-dom';

export default function Profile() {
    const { username, nickname, logout } = useAuth();
    const navigate = useNavigate();
    const [agreementVisible, setAgreementVisible] = useState(false);
    const [privacyVisible, setPrivacyVisible] = useState(false);

    const handleLogout = () => {
        Dialog.confirm({
            content: '确定要退出登录吗？',
            confirmText: '确定退出',
            cancelText: '取消',
            onConfirm: () => {
                logout();
                Toast.show({
                    icon: 'success',
                    content: '已退出登录'
                });
                navigate('/login');
            }
        });
    };

    const menuItems = [
        { icon: <UnorderedListOutline />, title: '品种设置', desc: '管理鹦鹉品种信息', onClick: () => navigate('/parrot-web/species') },
        { icon: <UserContactOutline />, title: '退出登录', desc: '安全退出当前账户', onClick: handleLogout, isDanger: false }
    ];

    return (
        <div style={{ backgroundColor: '#f5f5f5', minHeight: '100vh', paddingBottom: '80px' }}>
            {/* 用户信息卡片 */}
            <div style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                padding: '40px 20px 30px',
                position: 'relative'
            }}>
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    color: 'white'
                }}>
                    <Avatar
                        src="public/vite.svg"
                        style={{
                            '--size': '80px',
                            marginRight: '20px',
                            padding: '8px',
                            border: '3px solid rgba(255,255,255,0.3)'
                        }}
                    >
                        <UserOutline style={{ fontSize: '32px' }} />
                    </Avatar>
                    <div style={{ flex: 1 }}>
                        <div style={{
                            fontSize: '24px',
                            fontWeight: 'bold',
                            marginBottom: '8px',
                            textShadow: '0 1px 2px rgba(0,0,0,0.1)'
                        }}>
                            {nickname || username}
                        </div>
                        <div style={{
                            fontSize: '16px',
                            opacity: 0.9,
                            marginBottom: '8px'
                        }}>
                            @{username}
                        </div>
                        <Tag color='success' style={{ fontSize: '12px' }}>
                            在线
                        </Tag>
                    </div>
                </div>
            </div>

            {/* 账户信息 */}
            <div style={{ padding: '20px' }}>


                {/* 功能菜单 */}
                <Card title="功能设置" style={{
                    marginBottom: '16px'
                }}>
                    <List mode="card">
                        {menuItems.map((item, index) => (
                            <List.Item
                                key={index}
                                prefix={React.cloneElement(item.icon, {
                                    style: {
                                        color: item.isDanger ? '#ff4d4f' : '#666',
                                        fontSize: '20px'
                                    }
                                })}
                                onClick={item.onClick}
                                clickable
                            >
                                <div>
                                    <div style={{
                                        color: item.isDanger ? '#ff4d4f' : 'inherit'
                                    }}>
                                        {item.title}
                                    </div>
                                    <div style={{ fontSize: '12px', color: '#999', marginTop: '2px' }}>
                                        {item.desc}
                                    </div>
                                </div>
                            </List.Item>
                        ))}
                    </List>
                </Card>

                {/* 应用信息 */}
                <Card title="关于" style={{ marginBottom: '20px' }}>
                    <List
                        mode="card"
                        arrowIcon={false}
                    >
                        <List.Item extra="v1.0.0">版本信息</List.Item>
                        <List.Item
                            clickable
                            onClick={() => setAgreementVisible(true)}
                        >
                            用户协议
                        </List.Item>
                        <List.Item
                            clickable
                            onClick={() => setPrivacyVisible(true)}
                        >
                            隐私政策
                        </List.Item>
                    </List>
                </Card>

            </div>

            {/* 用户协议弹窗 */}
            <Modal
                visible={agreementVisible}
                onClose={() => setAgreementVisible(false)}
                content={
                    <div style={{ padding: '16px', maxHeight: '60vh', overflow: 'auto' }}>
                        <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>用户服务协议</h2>

                        <h3>1. 服务条款的确认和接纳</h3>
                        <p>欢迎使用鹦鹉管理系统！本协议是您与我们之间关于您使用我们服务的法律协议。通过访问和使用我们的服务，您同意受本协议的约束。</p>

                        <h3>2. 服务说明</h3>
                        <p>鹦鹉管理系统为用户提供鹦鹉信息管理、笼子管理、品种统计等功能。我们保留在任何时候修改或中断服务的权利。</p>

                        <h3>3. 用户行为规范</h3>
                        <p>用户在使用服务时应当：</p>
                        <ul style={{ paddingLeft: '20px' }}>
                            <li>遵守相关法律法规</li>
                            <li>不得恶意攻击系统</li>
                            <li>不得发布虚假信息</li>
                            <li>妥善保管账户信息</li>
                        </ul>

                        <h3>4. 知识产权</h3>
                        <p>本系统的所有内容，包括但不限于文字、图片、音频、视频、图表、界面设计、版面布局、电子文档等均受著作权、商标权及其它法律保护。</p>

                        <h3>5. 免责声明</h3>
                        <p>在法律允许的最大范围内，我们对因使用或无法使用服务而导致的任何直接、间接、偶然、特殊或后果性损害不承担责任。</p>

                        <h3>6. 协议的修改和终止</h3>
                        <p>我们有权在任何时候修改本协议。如果您不同意修改内容，请停止使用服务。继续使用服务将视为您接受修改后的协议。</p>

                        <h3>7. 联系我们</h3>
                        <p>如果您对本协议有任何疑问，请联系我们的客服团队。</p>

                    </div>
                }
                closeOnAction
                actions={[
                    {
                        key: 'confirm',
                        text: '我已阅读',
                        primary: true
                    }
                ]}
            />

            {/* 隐私政策弹窗 */}
            <Modal
                visible={privacyVisible}
                onClose={() => setPrivacyVisible(false)}
                content={
                    <div style={{ padding: '16px', maxHeight: '60vh', overflow: 'auto' }}>
                        <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>隐私政策</h2>

                        <h3>1. 信息收集</h3>
                        <p>我们可能收集以下类型的信息：</p>
                        <ul style={{ paddingLeft: '20px' }}>
                            <li><strong>账户信息：</strong>用户名、昵称、邮箱、手机号等注册信息</li>
                            <li><strong>使用信息：</strong>您如何使用我们的服务，包括访问时间、频率等</li>
                            <li><strong>设备信息：</strong>设备类型、操作系统、浏览器类型等</li>
                        </ul>

                        <h3>2. 信息使用</h3>
                        <p>我们使用收集的信息来：</p>
                        <ul style={{ paddingLeft: '20px' }}>
                            <li>提供、维护和改进我们的服务</li>
                            <li>处理您的请求和查询</li>
                            <li>发送重要通知和更新</li>
                            <li>确保服务安全和防止欺诈</li>
                        </ul>

                        <h3>3. 信息分享</h3>
                        <p>我们不会向第三方出售、出租或以其他方式分享您的个人信息，除非：</p>
                        <ul style={{ paddingLeft: '20px' }}>
                            <li>获得您的明确同意</li>
                            <li>法律要求或为了保护我们的权利</li>
                            <li>为了提供您要求的服务</li>
                        </ul>

                        <h3>4. 信息安全</h3>
                        <p>我们采取合理的技术和组织措施来保护您的个人信息免受未经授权的访问、使用、泄露、修改或销毁。</p>

                        <h3>5. 数据存储</h3>
                        <p>您的个人信息将存储在安全的服务器上。我们会在法律要求的期限内或为了履行本政策中描述的目的而保留您的信息。</p>

                        <h3>6. 您的权利</h3>
                        <p>您有权：</p>
                        <ul style={{ paddingLeft: '20px' }}>
                            <li>访问和更新您的个人信息</li>
                            <li>删除您的账户和相关信息</li>
                            <li>选择不接收我们的营销通讯</li>
                            <li>向我们查询个人信息的处理情况</li>
                        </ul>

                        <h3>7. Cookie使用</h3>
                        <p>我们使用Cookie和类似技术来改善用户体验、分析网站使用情况和提供个性化内容。</p>

                        <h3>8. 政策更新</h3>
                        <p>我们可能会不时更新此隐私政策。重大变更时，我们会通过适当方式通知您。</p>

                        <h3>9. 联系我们</h3>
                        <p>如果您对此隐私政策有任何疑问或顾虑，请通过以下方式联系我们：</p>
                        <p>邮箱：privacy@parrotmanager.com</p>

                    </div>
                }
                closeOnAction
                actions={[
                    {
                        key: 'confirm',
                        text: '我已阅读',
                        primary: true
                    }
                ]}
            />
        </div>
    );
}