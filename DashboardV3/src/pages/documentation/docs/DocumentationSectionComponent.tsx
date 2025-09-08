import React from 'react';
import CodeBlockComponent from './CodeBlockComponent';
import type { DocumentationSection } from '../../../types';

interface DocumentationSectionProps {
  section: DocumentationSection;
}

const DocumentationSectionComponent: React.FC<DocumentationSectionProps> = ({ section }) => {
  return (
    <section id={section.id} style={{ marginBottom: '2rem' }}>
      <h3>{section.title}</h3>
      <p style={{ opacity: 0.8 }} >{section.content}</p>
      {section.codeBlocks && section.codeBlocks.length > 0 && (
        <div style={{ marginTop: '1rem' }}>
          {section.codeBlocks.map((block, index) => (
            <CodeBlockComponent key={index} language={block.language} code={block.code} />
          ))}
        </div>
      )}
      {section.images && section.images.length > 0 && (
        <div style={{ marginTop: '1rem' }}>
          {section.images.map((imgSrc, index) => (
            <img key={index} src={imgSrc} alt={`${section.title} image`} style={{ maxWidth: '100%', height: 'auto', display: 'block' }} />
          ))}
        </div>
      )}
      {section.subsections && section.subsections.length > 0 && (
        <div style={{ paddingLeft: '2rem' }}>
          {section.subsections.map((subsection) => (
            <DocumentationSectionComponent key={subsection.id} section={subsection} />
          ))}
        </div>
      )}
    </section>
  );
};

export default DocumentationSectionComponent;