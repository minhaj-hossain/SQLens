import fs from 'fs';
import path from 'path';

export type LessonStep =
  | { type: 'concept'; title: string; contentMd: string }
  | {
      type: 'task';
      title: string;
      instructionsMd: string;
      initialCode: string;
      testCode: string;
    };

export function parseAiModule(trackSlug: string, moduleSlug: string): LessonStep[] {
  const filePath = path.join(process.cwd(), 'docs', 'ai_curriculum', `${trackSlug}-${moduleSlug}.md`);
  
  if (!fs.existsSync(filePath)) {
    throw new Error(`Curriculum file not found: ${filePath}`);
  }

  const fileContent = fs.readFileSync(filePath, 'utf-8');
  
  // Split the markdown file by H2 headings (## )
  const sections = fileContent.split(/^##\s+/m).filter(s => s.trim() !== '');
  
  const steps: LessonStep[] = [];

  for (const section of sections) {
    if (section.startsWith('[CONCEPT')) {
      const firstLineBreak = section.indexOf('\n');
      const titleLine = section.substring(0, firstLineBreak).trim();
      const contentMd = section.substring(firstLineBreak + 1).trim();
      
      steps.push({
        type: 'concept',
        title: titleLine.replace(/^\[CONCEPT\s*\d+\]\s*/, ''),
        contentMd,
      });
    } else if (section.startsWith('[TASK')) {
      const firstLineBreak = section.indexOf('\n');
      const titleLine = section.substring(0, firstLineBreak).trim();
      const body = section.substring(firstLineBreak + 1);

      // Parse the task blocks using regex
      // We look for everything between "**Instructions:**" and "**Initial Code:**"
      const instructionsMatch = body.match(/\*\*Instructions:\*\*(.*?)(?=\*\*Initial Code:\*\*)/s);
      
      // We specifically grab the python code block contents
      const initialCodeMatch = body.match(/\*\*Initial Code:\*\*\s*```python\n(.*?)```/s);
      const testCodeMatch = body.match(/\*\*Hidden Test Code:\*\*\s*```python\n(.*?)```/s);

      steps.push({
        type: 'task',
        title: titleLine.replace(/^\[TASK\s*\d+\]\s*/, ''),
        instructionsMd: instructionsMatch ? instructionsMatch[1].trim() : '',
        initialCode: initialCodeMatch ? initialCodeMatch[1].trim() : '',
        testCode: testCodeMatch ? testCodeMatch[1].trim() : '',
      });
    }
  }

  return steps;
}
