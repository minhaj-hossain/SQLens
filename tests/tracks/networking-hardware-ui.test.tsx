import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { NetworkingThemeProvider, useNetworkingTheme } from '../../src/components/learning/networking/hardware/NetworkingThemeContext';
import { RealisticRj45Cable } from '../../src/components/learning/networking/hardware/RealisticRj45Cable';
import { RealisticSwitchChassis } from '../../src/components/learning/networking/hardware/RealisticSwitchChassis';
import { RealisticNicSiliconModal } from '../../src/components/learning/networking/hardware/RealisticNicSiliconModal';
import { RealisticWireBus } from '../../src/components/learning/networking/hardware/RealisticWireBus';
import { PhysicalConnectionCanvas } from '../../src/components/learning/networking/PhysicalConnectionCanvas';
import { soundFx } from '../../src/lib/networking/audio-fx';

describe('Networking Realistic Hardware & Theme System', () => {
  it('renders RealisticRj45Cable with gold pins, crystal plastic latch, and accessible status', () => {
    const htmlPlugged = renderToStaticMarkup(
      <RealisticRj45Cable isPlugged={true} onToggle={vi.fn()} label="Test Cable" />,
    );
    expect(htmlPlugged).toContain('data-testid="realistic-rj45-cable"');
    expect(htmlPlugged).toContain('LINK 1Gbps SEATED');
    expect(htmlPlugged).toContain('8P8C T568B');
    expect(htmlPlugged).toContain('goldContact');

    const htmlUnplugged = renderToStaticMarkup(
      <RealisticRj45Cable isPlugged={false} onToggle={vi.fn()} label="Test Cable" />,
    );
    expect(htmlUnplugged).toContain('DISCONNECTED');
  });

  it('renders RealisticSwitchChassis with 1U rack ears, port gang block, and LEDs', () => {
    const html = renderToStaticMarkup(
      <RealisticSwitchChassis
        title="Core-SW-01"
        model="Gigabit Switch"
        ports={[
          { portNumber: 1, isConnected: true, isActive: true, speed: '1000M', vlan: 10 },
          { portNumber: 2, isConnected: false, isActive: false, speed: 'Down', vlan: 1 },
        ]}
      />,
    );

    expect(html).toContain('data-testid="realistic-switch-chassis"');
    expect(html).toContain('Core-SW-01');
    expect(html).toContain('CONSOLE RJ-45');
    expect(html).toContain('#1');
    expect(html).toContain('#2');
  });

  it('renders RealisticNicSiliconModal with macro view and factory MAC VIN', () => {
    const html = renderToStaticMarkup(
      <RealisticNicSiliconModal
        isOpen={true}
        onClose={vi.fn()}
        macAddress="00-1A-2B-3C-4D-10"
        hostname="Acme-PC-01"
      />,
    );

    expect(html).toContain('data-testid="nic-silicon-modal"');
    expect(html).toContain('MAC: 00-1A-2B-3C-4D-10');
    expect(html).toContain('PCIe Network Interface Card (NIC)');
    expect(html).toContain('Layer 2 Silicon');
    expect(html).toContain('OUI Vendor Prefix: 00-1A-2B');
  });

  it('renders RealisticWireBus with copper path and flowing packet frames', () => {
    const html = renderToStaticMarkup(
      <RealisticWireBus
        isConnected={true}
        isTransmitting={true}
        fromLabel="Host A"
        toLabel="Switch 1"
        packetType="ARP"
      />,
    );

    expect(html).toContain('data-testid="realistic-wire-bus"');
    expect(html).toContain('cableCopper');
    expect(html).toContain('Host A');
    expect(html).toContain('Switch 1');
    expect(html).toContain('1000BASE-T');
  });

  it('renders PhysicalConnectionCanvas with integrated realistic hardware and theme toggle', () => {
    const html = renderToStaticMarkup(
      <NetworkingThemeProvider>
        <PhysicalConnectionCanvas isCableSeated={true} onToggleCable={vi.fn()} />
      </NetworkingThemeProvider>,
    );

    expect(html).toContain('data-testid="physical-connection-canvas"');
    expect(html).toContain('Link: 100 Mbps UP');
    expect(html).toContain('NIC Buffer');
    expect(html).toContain('Your computer');
    expect(html).toContain('Light: ON');
  });

  it('supports audio engine mute and toggle', () => {
    expect(soundFx.getIsMuted()).toBe(false);
    soundFx.setMuted(true);
    expect(soundFx.getIsMuted()).toBe(true);
    soundFx.toggleMute();
    expect(soundFx.getIsMuted()).toBe(false);
  });
});
