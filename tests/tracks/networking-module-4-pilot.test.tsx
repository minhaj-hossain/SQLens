/**
 * Module 4 Subnetting Pilot Test Suite
 * ─────────────────────────────────────────────────────────────────────────────
 * Validates the 5-Stage Cognitive Fading Model and Assessed Active-Octet Transfer:
 *  - Stage 1: Observe (Worked example 192.168.10.130/26)
 *  - Stage 2: Complete (Guided practice with intermediate fields 192.168.10.65/26)
 *  - Stage 3: Perform Independently (Faded visualizer 172.16.20.100/27)
 *  - Stage 4: Transfer (Router-on-a-Stick 802.1Q trunk & forwarding 10.10.4.82/28)
 *  - Stage 5: Diagnose (Host routing engine & dual-device alignment 192.168.1.120/25)
 *  - Section 8: Active-Octet Transfer Assessment (10.50.14.73/22)
 *  - Section 9: Delayed Retest Arithmetic (172.20.45.10/20)
 */

import React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { NET_04_MODULE } from '../../src/content/networking/modules/net-04';
import { calculateSubnet, SubnetBitSlicer } from '../../src/components/learning/networking/SubnetBitSlicer';
import { StructuredTaskGrader } from '../../src/components/learning/networking/StructuredTaskGrader';
import { RouterOnAStickDiagram, HostTelemetryTerminal } from '../../src/components/learning/networking/SubnetPilotVisuals';
import { NetworkingPracticeTaskView } from '../../src/components/learning/networking/NetworkingPracticeTaskView';
import type { PracticeTask } from '../../src/types/curriculum';

describe('Module 4 Pilot: Subnet Math Engine & Active-Octet Invariants', () => {
  it('correctly calculates Stage 1 parameters (192.168.10.130/26)', () => {
    const res = calculateSubnet('192.168.10.130', 26);
    expect(res.maskDotted).toBe('255.255.255.192');
    expect(res.networkDotted).toBe('192.168.10.128');
    expect(res.broadcastDotted).toBe('192.168.10.191');
    expect(res.firstUsableDotted).toBe('192.168.10.129');
    expect(res.lastUsableDotted).toBe('192.168.10.190');
    expect(res.usableHosts).toBe(62);
    expect(res.activeOctet).toBe(4);
    expect(res.blockIncrement).toBe(64);
  });

  it('correctly calculates Stage 2 parameters (192.168.10.65/26)', () => {
    const res = calculateSubnet('192.168.10.65', 26);
    expect(res.networkDotted).toBe('192.168.10.64');
    expect(res.broadcastDotted).toBe('192.168.10.127');
    expect(res.firstUsableDotted).toBe('192.168.10.65');
    expect(res.lastUsableDotted).toBe('192.168.10.126');
    expect(res.usableHosts).toBe(62);
    expect(res.blockIncrement).toBe(64);
  });

  it('correctly calculates Stage 3 parameters (172.16.20.100/27)', () => {
    const res = calculateSubnet('172.16.20.100', 27);
    expect(res.maskDotted).toBe('255.255.255.224');
    expect(res.networkDotted).toBe('172.16.20.96');
    expect(res.broadcastDotted).toBe('172.16.20.127');
    expect(res.firstUsableDotted).toBe('172.16.20.97');
    expect(res.lastUsableDotted).toBe('172.16.20.126');
    expect(res.usableHosts).toBe(30);
    expect(res.blockIncrement).toBe(32);
  });

  it('correctly calculates Stage 4 parameters (10.10.4.82/28)', () => {
    const res = calculateSubnet('10.10.4.82', 28);
    expect(res.maskDotted).toBe('255.255.255.240');
    expect(res.networkDotted).toBe('10.10.4.80');
    expect(res.broadcastDotted).toBe('10.10.4.95');
    expect(res.firstUsableDotted).toBe('10.10.4.81');
    expect(res.lastUsableDotted).toBe('10.10.4.94');
    expect(res.usableHosts).toBe(14);
    expect(res.blockIncrement).toBe(16);
  });

  it('correctly calculates Active-Octet 3rd octet parameters (10.50.14.73/22)', () => {
    const res = calculateSubnet('10.50.14.73', 22);
    expect(res.activeOctet).toBe(3);
    expect(res.hostBitsInActiveOctet).toBe(2); // 24 - 22 = 2
    expect(res.blockIncrement).toBe(4); // 2^2 = 4 in 3rd octet
    expect(res.maskDotted).toBe('255.255.252.0');
    expect(res.networkDotted).toBe('10.50.12.0');
    expect(res.broadcastDotted).toBe('10.50.15.255');
    expect(res.firstUsableDotted).toBe('10.50.12.1');
    expect(res.lastUsableDotted).toBe('10.50.15.254');
    expect(res.usableHosts).toBe(1022); // 2^10 - 2
  });

  it('correctly calculates RFC 3021 point-to-point /31 parameters (10.0.0.0/31)', () => {
    const res = calculateSubnet('10.0.0.0', 31);
    expect(res.maskDotted).toBe('255.255.255.254');
    expect(res.networkDotted).toBe('10.0.0.0');
    expect(res.broadcastDotted).toBe('10.0.0.1');
    expect(res.usableHosts).toBe(2); // RFC 3021: both are usable router endpoints
  });

  it('correctly calculates delayed retest parameters (172.20.45.10/20)', () => {
    const res = calculateSubnet('172.20.45.10', 20);
    expect(res.activeOctet).toBe(3);
    expect(res.blockIncrement).toBe(16); // 2^(24-20) = 16
    expect(res.maskDotted).toBe('255.255.240.0');
    expect(res.networkDotted).toBe('172.20.32.0');
    expect(res.broadcastDotted).toBe('172.20.47.255');
    expect(res.usableHosts).toBe(4094); // 2^12 - 2
  });
});

describe('Module 4 Pilot: Curriculum Stage Contracts', () => {
  const concept2 = NET_04_MODULE.concepts[1];
  const allConcept2Tasks = concept2.tasks;

  it('preserves existing net04-p2-subnet-decision as tasks[0] for backward compatibility', () => {
    expect(allConcept2Tasks[0].id).toBe('net04-p2-subnet-decision');
  });

  it('includes Stage 1 Observe (net04-stage1-observe)', () => {
    const task = allConcept2Tasks.find((t) => t.id === 'net04-stage1-observe');
    expect(task).toBeDefined();
    expect(task?.subnetting?.stage).toBe(1);
    expect(task?.subnetting?.targetIp).toBe('192.168.10.130');
    expect(task?.subnetting?.prefix).toBe(26);
    expect(task?.validation.judgment).toHaveLength(1);
    expect(task?.validation.judgment?.[0].correctIndex).toBe(0);
  });

  it('includes Stage 2 Complete (net04-stage2-complete) with 7 intermediate fields', () => {
    const task = allConcept2Tasks.find((t) => t.id === 'net04-stage2-complete');
    expect(task).toBeDefined();
    expect(task?.subnetting?.stage).toBe(2);
    expect(task?.subnetting?.fields).toHaveLength(7);

    // Verify targeted misconception for increment and network
    const incField = task?.subnetting?.fields?.find((f) => f.id === 'increment');
    expect(incField?.expected).toBe('64');
    expect(incField?.misconceptions?.[0].feedback).toContain('2^H');

    const netField = task?.subnetting?.fields?.find((f) => f.id === 'network_address');
    expect(netField?.expected).toBe('192.168.10.64');

    const capField = task?.subnetting?.fields?.find((f) => f.id === 'usable_capacity');
    expect(capField?.expected).toBe('62');
  });

  it('includes Stage 3 Perform Independently (net04-stage3-perform) with faded visualizer', () => {
    const task = allConcept2Tasks.find((t) => t.id === 'net04-stage3-perform');
    expect(task).toBeDefined();
    expect(task?.subnetting?.stage).toBe(3);
    expect(task?.subnetting?.isCollapsed).toBe(true); // Cognitive fading enforced
    expect(task?.subnetting?.reflectionPrompt).toBeDefined();
    expect(task?.subnetting?.modelExplanation).toBeDefined();

    const maskField = task?.subnetting?.fields?.find((f) => f.id === 'mask');
    expect(maskField?.expected).toBe('255.255.255.224');

    const netField = task?.subnetting?.fields?.find((f) => f.id === 'network');
    expect(netField?.expected).toBe('172.16.20.96');
    expect(netField?.misconceptions?.[0].feedback).toContain('assumed a /24 boundary');
  });

  it('includes Stage 4 Transfer (net04-stage4-transfer) with Router-on-a-Stick topology', () => {
    const task = allConcept2Tasks.find((t) => t.id === 'net04-stage4-transfer');
    expect(task).toBeDefined();
    expect(task?.subnetting?.stage).toBe(4);
    expect(task?.subnetting?.routerOnAStick).toBeDefined();
    expect(task?.subnetting?.routerOnAStick?.trunkPort).toBe(24);
    expect(task?.subnetting?.routerOnAStick?.subinterfaces).toHaveLength(2);

    const d1Status = task?.subnetting?.fields?.find((f) => f.id === 'dest1_status');
    expect(d1Status?.expected).toBe('local');

    const d2Status = task?.subnetting?.fields?.find((f) => f.id === 'dest2_status');
    expect(d2Status?.expected).toBe('remote');

    const d2Mac = task?.subnetting?.fields?.find((f) => f.id === 'dest2_mac');
    expect(d2Mac?.expected).toBe('gateway');
  });

  it('includes Stage 5 Diagnose (net04-stage5-diagnose) with host routing telemetry', () => {
    const task = allConcept2Tasks.find((t) => t.id === 'net04-stage5-diagnose');
    expect(task).toBeDefined();
    expect(task?.subnetting?.stage).toBe(5);
    expect(task?.subnetting?.diagnostics).toBeDefined();
    expect(task?.subnetting?.diagnostics?.routeTableOutput).toContain('unreachable - gateway not on link');

    const reconfigRouterIp = task?.subnetting?.fields?.find((f) => f.id === 'reconfig_router_ip');
    expect(reconfigRouterIp?.expected).toBe('192.168.1.1');

    const reconfigHostGw = task?.subnetting?.fields?.find((f) => f.id === 'reconfig_host_gw');
    expect(reconfigHostGw?.expected).toBe('192.168.1.1');
  });

  it('includes Active-Octet Transfer Assessment (net04-transfer-active-octet)', () => {
    const task = allConcept2Tasks.find((t) => t.id === 'net04-transfer-active-octet');
    expect(task).toBeDefined();
    expect(task?.hints).toHaveLength(0); // No hints allowed on assessment
    expect(task?.subnetting?.prefix).toBe(22);

    const actOctField = task?.subnetting?.fields?.find((f) => f.id === 'active_octet');
    expect(actOctField?.expected).toBe('3');

    const capField = task?.subnetting?.fields?.find((f) => f.id === 'usable_capacity');
    expect(capField?.expected).toBe('1022');

    const d1Field = task?.subnetting?.fields?.find((f) => f.id === 'dest1_forwarding');
    expect(d1Field?.expected).toBe('local');

    const d2Field = task?.subnetting?.fields?.find((f) => f.id === 'dest2_forwarding');
    expect(d2Field?.expected).toBe('remote');
  });
});

describe('Module 4 Pilot: Component Static Rendering & Structure', () => {
  it('renders SubnetBitSlicer with correct calculations in markup', () => {
    const markup = renderToStaticMarkup(
      <SubnetBitSlicer initialIp="192.168.10.130" initialPrefix={26} />
    );

    expect(markup).toContain('data-testid="subnet-bit-slicer"');
    expect(markup).toContain('data-testid="calc-network-address"');
    expect(markup).toContain('192.168.10.128');
    expect(markup).toContain('data-testid="calc-broadcast-address"');
    expect(markup).toContain('192.168.10.191');
    expect(markup).toContain('data-testid="calc-usable-hosts"');
    expect(markup).toContain('62');
  });

  it('renders RouterOnAStickDiagram with trunk port and dual subinterfaces', () => {
    const markup = renderToStaticMarkup(
      <RouterOnAStickDiagram
        workstationIp="10.10.4.82/28"
        dest1Ip="10.10.4.94/28"
        dest2Ip="10.10.4.98/28"
      />
    );

    expect(markup).toContain('data-testid="router-on-a-stick-diagram"');
    expect(markup).toContain('Router R1');
    expect(markup).toContain('Gig0/0.10');
    expect(markup).toContain('Gig0/0.20');
    expect(markup).toContain('Trunk Port 24');
    expect(markup).toContain('Workstation A');
    expect(markup).toContain('Destination 1');
    expect(markup).toContain('Destination 2');
  });

  it('renders HostTelemetryTerminal with simulated route status and ping failure', () => {
    const markup = renderToStaticMarkup(
      <HostTelemetryTerminal
        routeOutput="default via 192.168.1.129 dev eth0 [status: unreachable - gateway not on link]"
        pingOutput="PING 192.168.1.129: Destination host unreachable"
        packetCount={0}
      />
    );

    expect(markup).toContain('data-testid="host-telemetry-terminal"');
    expect(markup).toContain('unreachable - gateway not on link');
    expect(markup).toContain('Destination host unreachable');
    expect(markup).toContain('0 packets transmitted');
  });

  it('renders StructuredTaskGrader with fields and submit button', () => {
    const onGrade = vi.fn();
    const fields = [
      {
        id: 'network',
        label: 'Subnet Network Address',
        expected: '192.168.10.64',
      },
    ];

    const markup = renderToStaticMarkup(
      <StructuredTaskGrader fields={fields} onGrade={onGrade} />
    );

    expect(markup).toContain('data-testid="structured-task-grader"');
    expect(markup).toContain('data-testid="field-input-network"');
    expect(markup).toContain('data-testid="submit-structured-grader"');
  });

  it('renders NetworkingPracticeTaskView with Subnetting Lab layout', () => {
    const onTaskSuccess = vi.fn();
    const task = NET_04_MODULE.concepts[1].tasks.find((t) => t.id === 'net04-stage2-complete')!;

    const markup = renderToStaticMarkup(
      <NetworkingPracticeTaskView
        task={task as PracticeTask}
        taskIndex={1}
        totalTasks={7}
        concept={NET_04_MODULE.concepts[1]}
        onTaskSuccess={onTaskSuccess}
      />
    );

    expect(markup).toContain('data-testid="subnet-bit-slicer"');
    expect(markup).toContain('data-testid="structured-task-grader"');
    expect(markup).toContain('Subnetting Lab');
  });
});
