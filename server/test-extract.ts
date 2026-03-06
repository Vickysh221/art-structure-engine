import { extractStructure } from './extract';

// 模拟输入文本
const testText = `米开朗基罗（Michelangelo Buonarroti）是文艺复兴时期最杰出的艺术家之一，以雕塑、绘画、建筑设计等多方面的成就著称。他最出名的作品之一是西斯廷教堂天顶的《创世纪》壁画。`;

// 测试提取功能
async function testExtraction() {
  try {
    const extraction = await extractStructure(testText);
    console.log('提取结果:');
    console.log('Styles:', extraction.styles);
    console.log('Artists:', extraction.artists);
    console.log('Periods:', extraction.periods);
    console.log('Relationships:', extraction.relationships);
  } catch (error) {
    console.error('提取失败:', error);
  }
}

testExtraction();
