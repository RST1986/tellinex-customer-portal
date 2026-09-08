export const HOME_STATES = {
  HEALTHY: 'HEALTHY',
  STREET_OUTAGE: 'STREET_OUTAGE',
  WIFI_WEAK: 'WIFI_WEAK',
  ENGINEER_ETA: 'ENGINEER_ETA',
  COLLISION_BILL_OUTAGE: 'COLLISION_BILL_OUTAGE',
}

export const homeFixtures = {
  HEALTHY: {
    health: 'Your Tellinex service is healthy',
    tone: 'success',
    exceptions: [],
    facts: [
      ['Internet', '920 Mb/s · Working'],
      ['Wi-Fi', 'Good'],
      ['Devices', '14 online'],
      ['Usage', 'On track this month'],
      ['Bill', 'J$7,500'],
      ['Next payment', '12 Sep · Auto-pay'],
    ],
    actions: [],
  },
  STREET_OUTAGE: {
    health: 'Outage on your street — fix by 18:00',
    tone: 'danger',
    exceptions: [
      { title: 'Network outage affecting your service', detail: 'We are working on it. Your Wi-Fi hub can remain online while Internet service is unavailable.' },
    ],
    facts: [
      ['Internet', 'Down · Network'],
      ['Wi-Fi', 'Hub online · No Internet'],
      ['Devices', '14 on Wi-Fi'],
      ['Usage', 'Unavailable during outage'],
      ['Bill', 'J$7,500'],
      ['Next payment', '12 Sep · Auto-pay'],
    ],
    actions: ['Get updates', 'Report still down'],
  },
  WIFI_WEAK: {
    health: 'Wi-Fi is weak upstairs',
    tone: 'warning',
    exceptions: [
      { title: 'Internet to your home is fine', detail: 'The issue is between some devices and your Wi-Fi, not the fibre line.' },
    ],
    facts: [
      ['Internet', '910 Mb/s · Working'],
      ['Wi-Fi', 'Weak at 2 devices'],
      ['Devices', 'Lounge TV · Bedroom iPad'],
      ['Usage', 'On track this month'],
      ['Bill', 'J$7,500'],
      ['Next payment', '12 Sep · Auto-pay'],
    ],
    actions: ['Improve Wi-Fi', 'Run speed check', 'Pause a device'],
  },
  ENGINEER_ETA: {
    health: 'Engineer tomorrow 08:00–13:00',
    tone: 'warning',
    exceptions: [
      { title: 'Fault visit scheduled', detail: 'Engineer details appear only while a real appointment exists.' },
    ],
    facts: [
      ['Internet', 'Intermittent'],
      ['Wi-Fi', 'Good when online'],
      ['Devices', '14 known devices'],
      ['Usage', 'On track this month'],
      ['Bill', 'J$7,500'],
      ['Next payment', '12 Sep · Auto-pay'],
    ],
    actions: ['Change appointment', 'Get ready', 'Message support'],
  },
  COLLISION_BILL_OUTAGE: {
    health: 'Two things need your attention',
    tone: 'danger',
    exceptions: [
      { title: 'Payment failed — J$7,500 due', detail: 'Service may suspend if the bill remains unpaid.' },
      { title: 'Separate: street outage until 18:00', detail: 'Paying the bill will not restore the street outage. These are two different causes.' },
    ],
    facts: [
      ['Internet', 'Down · Outage'],
      ['Wi-Fi', 'Hub online · No Internet'],
      ['Devices', '14 on Wi-Fi'],
      ['Usage', 'Unavailable during outage'],
      ['Bill', 'J$7,500 overdue'],
      ['Next payment', 'Action required'],
    ],
    actions: ['Pay now', 'Outage updates', 'Payment help'],
  },
}
