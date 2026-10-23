import { describe, it, expect } from 'vitest';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { NetworkingWorkspace } from '@/components/learning/networking/workspace/NetworkingWorkspace';
import { NetworkingLessonSidebar } from '@/components/learning/networking/sidebar/NetworkingLessonSidebar';
import { NET_01_MODULE, NET_02_MODULE, NET_03_MODULE } from '@/content/networking';

describe('NetworkingWorkspace Component', () => {
  it('renders Day 1 workspace with canvas, terminal prompt, and lesson card', () => {
    const html = renderToStaticMarkup(
      <NetworkingWorkspace module={NET_01_MODULE} />
    );

    // Header title
    expect(html).toContain('Day 1 · The First Link &amp; Hardware Identity');
    // Step indicator & group tag
    expect(html).toContain('Idea 1 of 5 · The connection');
    expect(html).toContain('The cable: the physical link');
    // Command code snippet
    expect(html).toContain('link status');
    // Terminal prompt
    expect(html).toContain('PC1&gt;');
    expect(html).toContain('Terminal · PC1');
  });

  it('renders Day 2 workspace with IP addressing content', () => {
    const html = renderToStaticMarkup(
      <NetworkingWorkspace module={NET_02_MODULE} />
    );

    expect(html).toContain('Day 2 · IP Addressing: Networks and Hosts');
    expect(html).toContain('The subnet mask: splitting the address');
    expect(html).toContain('subnet');
  });

  it('renders Day 3 workspace with Subnetting content', () => {
    const html = renderToStaticMarkup(
      <NetworkingWorkspace module={NET_03_MODULE} />
    );

    expect(html).toContain('Day 3 · Subnetting: Splitting a Network');
    expect(html).toContain('Prefix length: a shorter way to write the mask');
    expect(html).toContain('cidr');
  });

  it('gates the Next button when task is not completed', () => {
    // When completedSteps is empty on step 0 (which has command "link status")
    const htmlUncompleted = renderToStaticMarkup(
      <NetworkingLessonSidebar
        steps={NET_01_MODULE.steps}
        activeStepIndex={0}
        setActiveStepIndex={() => {}}
        completedSteps={new Set()}
        onCodeClick={() => {}}
      />
    );

    // Next button has disabled attribute and title indicating task must be completed
    expect(htmlUncompleted).toContain('disabled=""');
    expect(htmlUncompleted).toContain('title="Complete the current task to continue"');

    // When step 0 is completed in completedSteps
    const htmlCompleted = renderToStaticMarkup(
      <NetworkingLessonSidebar
        steps={NET_01_MODULE.steps}
        activeStepIndex={0}
        setActiveStepIndex={() => {}}
        completedSteps={new Set([0])}
        onCodeClick={() => {}}
      />
    );

    // Next button is enabled and has title="Next step"
    expect(htmlCompleted).toContain('title="Next step"');
    expect(htmlCompleted).toContain('✓ Done – nice work');
    expect(htmlCompleted).toContain('Ctrl+Enter');
    expect(htmlCompleted).toContain('shadow-[0_0_14px_rgba(74,222,128,0.25)]');
  });

  it('renders terminal ergonomics hints and shortcuts', () => {
    const html = renderToStaticMarkup(
      <NetworkingWorkspace module={NET_01_MODULE} />
    );

    // Terminal clear shortcut hint
    expect(html).toContain('[Ctrl+L] clear');
    // Tab autocomplete hint
    expect(html).toContain('[Tab]');
  });
});
