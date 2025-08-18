import React, {useEffect, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {
    NavBar,
    ProgressBar,
    Tabs,
    Toast,
    SpinLoading,
    Grid,
    Card,
    List
} from 'antd-mobile';
import {AppstoreOutline, CompassOutline, HistogramOutline, ScanCodeOutline} from 'antd-mobile-icons';
import ReactECharts from 'echarts-for-react';
import {
    getAllParrots, getCagesWithParrotCountAll, getSpeciesList
} from '../api';
import './Statistics.css';

export default function ParrotStatistics() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('summary');
    const [stats, setStats] = useState({
        cageStats: {
            total: 0,
            used: 0,
            empty: 0,
            utilizationRate: 0
        },
        parrotStats: {
            total: 0,
            male: 0,
            female: 0,
            unknownGender: 0
        },
        speciesStats: []
    });

    useEffect(() => {
        fetchStatistics();
    }, []);

    const fetchStatistics = async () => {
        setLoading(true);
        try {
            const [cagesRes, parrotsRes, speciesRes] = await Promise.all([
                getCagesWithParrotCountAll(),
                getAllParrots(),
                getSpeciesList()
            ]);

            // 处理笼子数据 - 确保parrotCount是数字
            const cages = (cagesRes.data || []).map(cage => ({
                ...cage
            }));

            // 处理鹦鹉数据
            const parrots = parrotsRes.data?.records || [];

            // 计算笼子统计
            // const usedCages = cages.filter(c => parseInt(c.parrotCount) > 0).length;.
            const usedCages = cages.filter(cage => cage.parrotCount > 0).length;
            const emptyCages = cages.length - usedCages;
            const utilizationRate = cages.length > 0
                ? (usedCages / cages.length * 100).toFixed(1)
                : 0;

            // 计算鹦鹉性别统计
            const maleCount = parrots.filter(p => p.gender === '公' || p.gender === 'male').length;
            const femaleCount = parrots.filter(p => p.gender === '母' || p.gender === 'female').length;
            const unknownGenderCount = parrots.length - maleCount - femaleCount;

            // 计算品种统计
            const speciesStats = (speciesRes.data || []).map(species => {
                const speciesParrots = parrots.filter(p => p.species === species.id);
                return {
                    speciesId: species.id,
                    speciesName: species.name,
                    total: speciesParrots.length,
                    male: speciesParrots.filter(p => p.gender === '公' || p.gender === 'male').length,
                    female: speciesParrots.filter(p => p.gender === '母' || p.gender === 'female').length
                };
            });

            setStats({
                cageStats: {
                    total: cages.length,
                    used: usedCages,
                    empty: emptyCages,
                    utilizationRate
                },
                parrotStats: {
                    total: parrots.length,
                    male: maleCount,
                    female: femaleCount,
                    unknownGender: unknownGenderCount
                },
                speciesStats
            });

        } catch (error) {
            Toast.show({content: '获取统计数据失败'});
            console.error('获取统计数据失败:', error);
        } finally {
            setLoading(false);
        }
    };


    const renderSummaryCards = () => {
        return (
            <Grid columns={2} gap={8}>
                <Grid.Item>
                    <Card title="笼子总数" className="stat-card" style={{
                        color: '#2e89ff',
                    }}>
                        {stats.cageStats.total}
                    </Card>
                </Grid.Item>
                <Grid.Item>
                    <Card title="笼子使用率" className="stat-card" style={{
                        color: '#2e89ff',
                    }}>
                        {stats.cageStats.utilizationRate}%
                    </Card>
                </Grid.Item>
                <Grid.Item>
                    <Card title="鹦鹉总数" className="stat-card" style={{
                        color: '#2e89ff',
                    }}>
                        {stats.parrotStats.total}
                    </Card>
                </Grid.Item>
                <Grid.Item>
                    <Card title="品种数量" className="stat-card" style={{
                        color: '#2e89ff',
                    }}>
                        {stats.speciesStats.length}
                    </Card>
                </Grid.Item>
            </Grid>
        );
    };

    const renderCageUtilization = () => {
        const {used, empty, total} = stats.cageStats;

        const option = {
            title: {
                text: '笼子使用',
                left: 'center'
            },
            tooltip: {
                trigger: 'item',
                formatter: '{a} <br/>{b}: {c} ({d}%)'
            },
            legend: {
                orient: 'vertical',
                left: 'left',
                data: ['已使用笼子', '空笼子']
            },
            graphic: [{
                type: 'text',
                left: 'center',
                top: 'center',
                style: {
                    text: total.toString(),
                    textAlign: 'center',
                    fill: '#333',
                    fontSize: 28,
                    fontWeight: 'bold'
                }
            }],
            series: [
                {
                    name: '使用情况',
                    type: 'pie',
                    radius: ['40%', '70%'],
                    avoidLabelOverlap: false,
                    itemStyle: {
                        borderRadius: 5,
                        borderColor: '#fff',
                        borderWidth: 2
                    },
                    label: {
                        show: true,
                        formatter: '{b}: {c}个 \n({d}%)',
                        position: 'outside',
                        alignTo: 'labelLine',
                        bleedMargin: 5,
                        distanceToLabelLine: 5,
                        fontSize: 12,
                        fontWeight: 'bold'
                    },
                    labelLine: {
                        show: true,
                        length: 10,
                        length2: 15,
                        smooth: true,
                        lineStyle: {
                            width: 1,
                            type: 'solid'
                        }
                    },
                    emphasis: {
                        label: {
                            show: true,
                            fontSize: '14',
                            fontWeight: 'bold'
                        }
                    },
                    data: [
                        {value: used, name: '已使用笼子'},
                        {value: empty, name: '空笼子'}
                    ]
                }
            ]
        };


        return (
            <div className="cage-utilization-container" style={{
                marginTop: '8px',
                border: '1px solid #eee',
                background: '#fff',
                borderRadius: '8px',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
            }}>
                <ReactECharts option={option} style={{
                    height: 380,
                    padding: '12px',
                }}/>
            </div>
        );
    };

    const renderSpeciesDistribution = () => {
        const option = {
            title: {
                text: '鹦鹉品种分布',
                left: 'center'
            },
            tooltip: {
                trigger: 'item',
                formatter: '{a} <br/>{b}: {c} ({d}%)'
            },
            legend: {
                orient: 'vertical',
                left: 'left',
                data: stats.speciesStats.map(item => item.speciesName)
            },
            graphic: [{
                type: 'text',
                left: 'center',
                top: 'center',
                style: {
                    text: stats.parrotStats.total.toString(),
                    textAlign: 'center',
                    fill: '#333',
                    fontSize: 28,
                    fontWeight: 'bold'
                }
            }],
            series: [
                {
                    name: '品种数量',
                    type: 'pie',
                    radius: ['40%', '70%'],
                    avoidLabelOverlap: false,
                    itemStyle: {
                        borderRadius: 5,
                        borderColor: '#fff',
                        borderWidth: 2
                    },
                    label: {
                        show: true,
                        formatter: '{b}: {c}只\n({d}%)',
                        position: 'outside',
                        alignTo: 'labelLine',
                        bleedMargin: 5,
                        distanceToLabelLine: 5,
                        fontSize: 12,
                        fontWeight: 'bold'
                    },
                    labelLine: {
                        show: true,
                        length: 10,
                        length2: 15,
                        smooth: true,
                        lineStyle: {
                            width: 1,
                            type: 'solid'
                        }
                    },
                    emphasis: {
                        label: {
                            show: true,
                            fontSize: '14',
                            fontWeight: 'bold'
                        }
                    },
                    data: stats.speciesStats.map(item => ({
                        value: item.total,
                        name: item.speciesName
                    }))
                }
            ]
        };

        return <ReactECharts option={option} style={{
            height: 550,
            background: '#fff',
            borderRadius: 8,
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
            padding: 12
        }}/>;
    };

    const renderGenderBySpecies = () => {
        return (
            <div className="gender-by-species" style={{
                background: '#fff',
                borderRadius: 8,
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
            }}>
                <List header="各品种性别分布">
                    {stats.speciesStats.map(species => {
                        const malePercent = species.total > 0
                            ? (species.male / species.total * 100).toFixed(0)
                            : 0;
                        const femalePercent = species.total > 0
                            ? (species.female / species.total * 100).toFixed(0)
                            : 0;

                        return (
                            <List.Item
                                key={species.speciesId}
                                description={
                                    <div className="gender-distribution">
                                        <div style={{width: '100%', fontWeight: 'bold'}}>
                                            {species.speciesName} - 共{species.total}只
                                        </div>
                                        <div className={'gender-bars-detail'} style={{
                                            width: '100%', marginTop: '8px', display: 'flex', flexDirection: 'row',
                                            justifyContent: 'space-between',
                                        }}>
                                            <span style={{color: '#2e89ff'}}>公 {malePercent}%</span>
                                            <span style={{color: '#ff5699'}}>母 {femalePercent}%</span>
                                        </div>
                                        <ProgressBar
                                            percent={malePercent}
                                            // text= {<div>
                                            //     <span style={{ color: '#b2d5ff' }}>公 { malePercent}%</span>
                                            //     <span style={{ color: '#ffc0f6' }}>母 { femalePercent}%</span>
                                            // </div>}
                                            style={{
                                                '--fill-color': '#2e89ff',
                                                '--track-color': '#ff5699',
                                            }}
                                        />
                                    </div>
                                }
                            />
                        );
                    })}
                </List>
            </div>
        );
    };
    return (
        <div className="statistics-container">
            {/*<NavBar back="返回" onBack={handleBack}>*/}
            {/*    鹦鹉养殖统计*/}
            {/*</NavBar>*/}

            {loading ? (
                <div className="loading-container">
                    <SpinLoading style={{'--size': '48px'}} color="primary"/>
                </div>
            ) : (
                <div className="content-container">
                    <Tabs
                        activeKey={activeTab}
                        onChange={setActiveTab}
                        style={{
                            '--title-font-size': '14px',
                            '--content-padding': '0',
                            // 均匀横向分布
                            '--title-text-align': 'center',
                            '--title-flex': '1'

                        }}
                    >
                        <Tabs.Tab
                            title={
                                <div className="tab-title">
                                    <AppstoreOutline/>
                                    <span>总体概览</span>
                                </div>
                            }
                            key="summary"
                        >
                            {renderSummaryCards()}
                            {renderCageUtilization()}
                        </Tabs.Tab>
                        <Tabs.Tab
                            title={
                                <div className="tab-title">
                                    <CompassOutline/>
                                    <span>品种分布</span>
                                </div>
                            }
                            key="species"
                        >
                            {renderSpeciesDistribution()}
                        </Tabs.Tab>
                        <Tabs.Tab
                            title={
                                <div className="tab-title">
                                    <HistogramOutline/>
                                    <span>性别分布</span>
                                </div>
                            }
                            key="gender"
                        >
                            {renderGenderBySpecies()}
                        </Tabs.Tab>
                    </Tabs>
                </div>
            )}
        </div>
    );
}