/**
 * Sample events for the stories and tests: tests/fixtures/feed.json, a copy of the real feed,
 * through normalizeEvents(). Regenerate from the fixture rather than editing by hand.
 */
import type { EventItem } from './types.ts';

export const SAMPLE_EVENTS: readonly EventItem[] = [
	{
		id: '4223708',
		title: 'PAWS-a-tively Stress Free',
		url: 'https://events.ucf.edu/event/4223708/paws-a-tively-stress-free/',
		starts: '2026-11-06T11:00:00-05:00',
		ends: '2026-11-06T13:00:00-05:00',
		location: 'Counseling and Psychological Services',
		summary:
			'Need a stress break as we head into the last few weeks of the semester? Stop by CAPS and meet our therapy dog friends. The dogs will be at CAPS from 11:00 am to 1:00 pm and ready for snuggles.',
	},
	{
		id: '4223733',
		title: 'Guest Artist Masterclass: John Bruce Yeh, clarinet',
		url: 'https://events.ucf.edu/event/4223733/guest-artist-masterclass-john-bruce-yeh-clarinet/',
		starts: '2026-11-06T11:30:00-05:00',
		ends: '2026-11-06T12:30:00-05:00',
		location: 'PAC-Music, M120: 120',
		summary:
			'Please join us at UCF for a clarinet masterclass with the highly regarded and versatile clarinetist John Bruce Yeh, Assistant Principal Clarinet and E-flat Clarinet of the Chicago Symphony Orchestra. Admission is Free.',
	},
	{
		id: '4197667',
		title: 'Belay Class',
		url: 'https://events.ucf.edu/event/4197667/belay-class/',
		starts: '2026-11-06T12:00:00-05:00',
		ends: '2026-11-06T14:00:00-05:00',
		location: 'UCF Climbing Tower',
		summary:
			'One of the best ways to make the most of the UCF Climbing Tower is to become belay certified! This Climbing Tower-specific certification allows you to belay your friends while continuing to build your climbing skills. The Process: 1. Take…',
	},
	{
		id: '4198196',
		title: 'Virtual Career Drop-In',
		url: 'https://events.ucf.edu/event/4198196/virtual-career-drop-in/',
		starts: '2026-11-06T13:00:00-05:00',
		ends: '2026-11-06T15:00:00-05:00',
		location: 'Virtual',
		summary:
			"Join us this fall semester (Aug. 31–Nov. 20) on Fridays, any time between 1 and 3 p.m., via Zoom . Ask quick career questions, or we can critique your: Resume LinkedIn/Handshake profile Cover letter Elevator pitch Can't come during this…",
	},
	{
		id: '4232030',
		title: "UCF Men's Basketball vs. Yale",
		url: 'https://events.ucf.edu/event/4232030/ucf-mens-basketball-vs-yale/',
		starts: '2026-11-06T19:00:00-05:00',
		ends: '2026-11-06T21:30:00-05:00',
		location: 'Addition Financial Arena',
		summary:
			"The UCF men's basketball team hosts Yale at Addition Financial Arena. For the most up-to-date information, visit ucfknights.com/sports/mens-basketball . Tickets: General Public | Students Follow UCF Men's Basketball on Social Media: X/Twitter: @UCF_MBB Instagram: @ucf.mbb Facebook: UCF Men's Basketball page",
	},
	{
		id: '4225904',
		title: "RWC's MidKnight 5k",
		url: 'https://events.ucf.edu/event/4225904/rwcs-midknight-5k/',
		starts: '2026-11-06T22:30:00-05:00',
		ends: '2026-11-07T01:00:00-05:00',
		location: 'UCF Reflecting Pond',
		summary:
			"Join us for the Recreation and Wellness Center's Annual MidKnight 5K event. Participants will walk, jog or run 3.1 miles (5 kilometers) around UCF's campus at midnight. We will meet at the reflecting pond, there will be a DJ, snacks…",
	},
];
