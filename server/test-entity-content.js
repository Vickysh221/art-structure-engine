// 模拟 generateEntityContent 函数的逻辑
function getRelationshipLabel(type) {
  const labels = {
    direct: "直接关联",
    indirect: "间接关联",
    "many-to-many": "多对多关联",
  };
  return labels[type];
}

function generateEntityContent(name, type, noteFilename, extraction) {
  const noteLink = noteFilename.replace(".md", "");
  let content = `# ${name}

## 类型
${type}

## 关联笔记
- [[${noteLink}]]
`;

  const relatedEntities = [];

  extraction.relationships.forEach((rel) => {
    if (rel.from.name === name) {
      relatedEntities.push({
        type: rel.to.type,
        name: rel.to.name,
        relType: rel.type,
        description: rel.description,
      });
    }
    if (rel.to.name === name) {
      relatedEntities.push({
        type: rel.from.type,
        name: rel.from.name,
        relType: rel.type,
        description: rel.description,
      });
    }
  });

  if (relatedEntities.length > 0) {
    content += "\n## 关联实体\n";
    relatedEntities.forEach((entity) => {
      content += `- [[${entity.name}]] (${getRelationshipLabel(entity.relType)})`;
      if (entity.description) {
        content += ` - ${entity.description}`;
      }
      content += "\n";
    });
  }

  return content;
}

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

// 测试生成文艺复兴实体的内容
const renaissanceContent = generateEntityContent('文艺复兴', 'style', '2026-03-06-kkzgs4a1.md', mockExtraction);
console.log('文艺复兴实体内容:');
console.log(renaissanceContent);
