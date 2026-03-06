import { generateMarkdownFiles } from './markdown';

// 模拟输入文本
const testText = `米开朗基罗（Michelangelo Buonarroti）是文艺复兴时期最杰出的艺术家之一，以雕塑、绘画、建筑设计等多方面的成就著称。他最出名的作品之一是西斯廷教堂天顶的《创世纪》壁画。`;

// 模拟提取结果
const mockExtraction = {
  styles: ['文艺复兴'],
  artists: ['米开朗基罗'],
  periods: ['文艺复兴时期'],
  museums: [],
  relationships: [
    {
      type: 'direct',
      from: { type: 'artist', name: '米开朗基罗' },
      to: { type: 'style', name: '文艺复兴' },
      description: '米开朗基罗是文艺复兴时期的杰出艺术家'
    }
  ]
};

// 测试生成 Markdown 文件
const files = generateMarkdownFiles(testText, mockExtraction);
console.log('生成的文件:');
console.log('笔记文件:', files.note.filename);
console.log('\n实体文件:');
files.entities.forEach((entity) => {
  console.log(`\n${entity.type}: ${entity.filename}`);
  console.log('内容:');
  console.log(entity.content);
});
