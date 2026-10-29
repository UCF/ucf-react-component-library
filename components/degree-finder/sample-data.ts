/**
 * CONTEXT: real degree data for the sample client, so stories look like the live finder.
 *
 * Generated from the ucf.edu REST API on 2026-10-29: the whole program type tree, seven
 * interests per degree type, and every degree matching each. Normalized to the component's own
 * shapes (types.ts), as client.ts would return them. Refresh by hand when it drifts; nothing
 * depends on these exact records.
 */
import type { Degree, Interest, ProgramType } from './types.ts';

export const SAMPLE_PROGRAM_TYPES: readonly ProgramType[] = [
	{
		slug: 'undergraduate-program',
		name: 'Undergraduate Program',
		plural: 'Undergraduate Programs',
		count: 480,
		children: [
			{
				slug: 'bachelor',
				name: 'Bachelor',
				plural: 'Bachelors',
				count: 254,
				children: [],
			},
			{
				slug: 'minor',
				name: 'Minor',
				plural: 'Minors',
				count: 143,
				children: [],
			},
			{
				slug: 'undergraduate-certificate',
				name: 'Undergraduate Certificate',
				plural: 'Undergraduate Certificates',
				count: 83,
				children: [],
			},
		],
	},
	{
		slug: 'graduate-program',
		name: 'Graduate Program',
		plural: 'Graduate Programs',
		count: 429,
		children: [
			{
				slug: 'doctorate',
				name: 'Doctorate',
				plural: 'Doctorates',
				count: 87,
				children: [],
			},
			{
				slug: 'graduate-certificate',
				name: 'Graduate Certificate',
				plural: 'Graduate Certificates',
				count: 106,
				children: [],
			},
			{
				slug: 'master',
				name: 'Master',
				plural: 'Masters',
				count: 233,
				children: [],
			},
			{
				slug: 'specialist',
				name: 'Specialist',
				plural: 'Specialists',
				count: 4,
				children: [],
			},
		],
	},
	{
		slug: 'professional-program',
		name: 'Professional Program',
		plural: 'Professional Programs',
		count: 1,
		children: [],
	},
];

/** By program type slug. */
export const SAMPLE_INTERESTS: Readonly<
	Record< string, readonly Interest[] >
> = {
	bachelor: [
		{
			slug: 'biology-general',
			name: 'Biology, General',
		},
		{
			slug: 'computer-and-information-sciences-general',
			name: 'Computer and Information Sciences, General',
		},
		{
			slug: 'computer-engineering',
			name: 'Computer Engineering',
		},
		{
			slug: 'film-video-and-photographic-arts',
			name: 'Film/Video and Photographic Arts',
		},
		{
			slug: 'mechanical-engineering',
			name: 'Mechanical Engineering',
		},
		{
			slug: 'psychology-general',
			name: 'Psychology, General',
		},
		{
			slug: 'registered-nursing-nursing-administration-nursing-research-and-clinical-nursing',
			name: 'Registered Nursing, Nursing Administration, Nursing Research and Clinical Nursing',
		},
	],
	master: [
		{
			slug: 'biology-general',
			name: 'Biology, General',
		},
		{
			slug: 'computer-and-information-sciences-general',
			name: 'Computer and Information Sciences, General',
		},
		{
			slug: 'computer-engineering',
			name: 'Computer Engineering',
		},
		{
			slug: 'film-video-and-photographic-arts',
			name: 'Film/Video and Photographic Arts',
		},
		{
			slug: 'mechanical-engineering',
			name: 'Mechanical Engineering',
		},
		{
			slug: 'psychology-general',
			name: 'Psychology, General',
		},
		{
			slug: 'registered-nursing-nursing-administration-nursing-research-and-clinical-nursing',
			name: 'Registered Nursing, Nursing Administration, Nursing Research and Clinical Nursing',
		},
	],
	doctorate: [
		{
			slug: 'biology-general',
			name: 'Biology, General',
		},
		{
			slug: 'computer-and-information-sciences-general',
			name: 'Computer and Information Sciences, General',
		},
		{
			slug: 'computer-engineering',
			name: 'Computer Engineering',
		},
		{
			slug: 'mechanical-engineering',
			name: 'Mechanical Engineering',
		},
		{
			slug: 'psychology-general',
			name: 'Psychology, General',
		},
		{
			slug: 'registered-nursing-nursing-administration-nursing-research-and-clinical-nursing',
			name: 'Registered Nursing, Nursing Administration, Nursing Research and Clinical Nursing',
		},
	],
};

/** By `{programType}/{interest}`. */
export const SAMPLE_DEGREES: Readonly< Record< string, readonly Degree[] > > = {
	'bachelor/biology-general': [
		{
			id: 61143,
			title: 'Biology (BS)',
			url: 'https://www.ucf.edu/degree/biology-bs/',
		},
		{
			id: 64859,
			title: 'Biology (BS) – Ecology, Evolutionary and Conservation Track',
			url: 'https://www.ucf.edu/degree/biology-bs/ecology-evolutionary-and-conservation/',
		},
		{
			id: 64860,
			title: 'Biology (BS) – General Biology Track',
			url: 'https://www.ucf.edu/degree/biology-bs/general-biology/',
		},
		{
			id: 64861,
			title: 'Biology (BS) – Marine and Aquatic Track',
			url: 'https://www.ucf.edu/degree/biology-bs/marine-and-aquatic/',
		},
		{
			id: 64862,
			title: 'Biology (BS) – Plant Sciences Track',
			url: 'https://www.ucf.edu/degree/biology-bs/plant-sciences/',
		},
		{
			id: 64863,
			title: 'Biology (BS) – Pre-Health Professional Track',
			url: 'https://www.ucf.edu/degree/biology-bs/pre-health-professional/',
		},
		{
			id: 64864,
			title: 'Biology (BS) – Zoology and Pre-Veterinarian Science',
			url: 'https://www.ucf.edu/degree/biology-bs/zoology-and-pre-veterinarian-science/',
		},
		{
			id: 70423,
			title: 'Biomedical Sciences (BS)',
			url: 'https://www.ucf.edu/degree/biomedical-sciences-bs/',
		},
		{
			id: 87831,
			title: 'Biomedical Sciences (BS) – Integrated Biomedical Sciences Track',
			url: 'https://www.ucf.edu/degree/biomedical-sciences-bs/integrated-biomedical-sciences-track/',
		},
		{
			id: 70427,
			title: 'Biomedical Sciences (BS) – Neuroscience',
			url: 'https://www.ucf.edu/degree/biomedical-sciences-bs/neuroscience/',
		},
		{
			id: 80155,
			title: 'Biomedical Sciences (BS) – Pre-Medical Track',
			url: 'https://www.ucf.edu/degree/biomedical-sciences-bs/pre-medical-track/',
		},
	],
	'bachelor/computer-and-information-sciences-general': [
		{
			id: 61188,
			title: 'Computer Science (BS)',
			url: 'https://www.ucf.edu/degree/computer-science-bs/',
		},
		{
			id: 64743,
			title: 'Computer Science (BS) – Accelerated BS to MS',
			url: 'https://www.ucf.edu/degree/computer-science-bs/accelerated-bs-to-ms/',
		},
		{
			id: 84603,
			title: 'Computer Science (BS) – BS to Cyber Security and Privacy MS Track',
			url: 'https://www.ucf.edu/degree/computer-science-bs/bs-to-cyber-security-and-privacy-ms-track/',
		},
		{
			id: 61306,
			title: 'Information Technology (BS)',
			url: 'https://www.ucf.edu/degree/information-technology-bs/',
		},
		{
			id: 84604,
			title: 'Information Technology (BS) – Accelerated BS to Cyber Security & Privacy MS Track',
			url: 'https://www.ucf.edu/degree/information-technology-bs/accelerated-bs-to-cyber-security-privacy-ms-track/',
		},
	],
	'bachelor/computer-engineering': [
		{
			id: 61178,
			title: 'Computer Engineering (BSCpE)',
			url: 'https://www.ucf.edu/degree/computer-engineering-bscpe/',
		},
		{
			id: 64901,
			title: 'Computer Engineering (BSCpE) – Comprehensive Track',
			url: 'https://www.ucf.edu/degree/computer-engineering-bscpe/comprehensive-track/',
		},
		{
			id: 64902,
			title: 'Computer Engineering (BSCpE) – Digital VLSI Circuits Track',
			url: 'https://www.ucf.edu/degree/computer-engineering-bscpe/digital-vlsi-circuits-track/',
		},
	],
	'bachelor/film-video-and-photographic-arts': [
		{
			id: 80664,
			title: 'Film (BA)',
			url: 'https://www.ucf.edu/degree/film-ba/',
		},
		{
			id: 63354,
			title: 'Film (BFA)',
			url: 'https://www.ucf.edu/degree/film-bfa/',
		},
	],
	'bachelor/mechanical-engineering': [
		{
			id: 61347,
			title: 'Mechanical Engineering (BSME)',
			url: 'https://www.ucf.edu/degree/mechanical-engineering-bsme/',
		},
		{
			id: 87710,
			title: 'Mechanical Engineering (BSME) – Accelerated BS to MS Track',
			url: 'https://www.ucf.edu/degree/mechanical-engineering-bsme/accelerated-bs-to-ms-track/',
		},
	],
	'bachelor/psychology-general': [
		{
			id: 61401,
			title: 'Psychology (BS)',
			url: 'https://www.ucf.edu/degree/psychology-bs/',
		},
		{
			id: 64791,
			title: 'Psychology (BS) – Clinical Psychology Track',
			url: 'https://www.ucf.edu/degree/psychology-bs/clinical-psychology-track/',
		},
		{
			id: 64794,
			title: 'Psychology (BS) – Cognition and Human Factors Psychology Track',
			url: 'https://www.ucf.edu/degree/psychology-bs/human-factors-psychology-track/',
		},
		{
			id: 64792,
			title: 'Psychology (BS) – Experimental Psychology Track',
			url: 'https://www.ucf.edu/degree/psychology-bs/experimental-psychology-track/',
		},
		{
			id: 64793,
			title: 'Psychology (BS) – General Psychology Track',
			url: 'https://www.ucf.edu/degree/psychology-bs/general-psychology-track/',
		},
		{
			id: 64795,
			title: 'Psychology (BS) – Industrial / Organizational Psychology Track',
			url: 'https://www.ucf.edu/degree/psychology-bs/industrial-organizational-psychology-track/',
		},
		{
			id: 64796,
			title: 'Psychology (BS) – Neuroscience Track',
			url: 'https://www.ucf.edu/degree/psychology-bs/neuroscience-track/',
		},
	],
	'bachelor/registered-nursing-nursing-administration-nursing-research-and-clinical-nursing':
		[
			{
				id: 61379,
				title: 'Nursing (BSN)',
				url: 'https://www.ucf.edu/degree/nursing-bsn/',
			},
			{
				id: 64350,
				title: 'Nursing (BSN) – Accelerated Second Degree BSN',
				url: 'https://www.ucf.edu/degree/nursing-bsn/accelerated-second-degree-bsn/',
			},
			{
				id: 61380,
				title: 'Nursing RN (BSN)',
				url: 'https://www.ucf.edu/degree/nursing-rn-bsn/',
			},
			{
				id: 64351,
				title: 'Nursing RN (BSN) – AS to BS',
				url: 'https://www.ucf.edu/degree/nursing-rn-bsn/as-to-bs/',
			},
			{
				id: 64353,
				title: 'Nursing RN (BSN) – Concurrent ASN to BSN – Seminole State Track',
				url: 'https://www.ucf.edu/degree/nursing-rn-bsn/concurrent-asn-to-bsn-seminole-state-track/',
			},
			{
				id: 64354,
				title: 'Nursing RN (BSN) – Concurrent ASN to BSN – Valencia College Track',
				url: 'https://www.ucf.edu/degree/nursing-rn-bsn/concurrent-asn-to-bsn-valencia-college-track/',
			},
			{
				id: 64352,
				title: 'Nursing RN (BSN) – RN-BSN',
				url: 'https://www.ucf.edu/degree/nursing-rn-bsn/rn-bsn/',
			},
		],
	'master/biology-general': [
		{
			id: 61144,
			title: 'Biology (MS)',
			url: 'https://www.ucf.edu/degree/biology-ms/',
		},
		{
			id: 61149,
			title: 'Biomedical Sciences (MS)',
			url: 'https://www.ucf.edu/degree/biomedical-sciences-ms/',
		},
		{
			id: 64873,
			title: 'Biomedical Sciences (MS) – Cancer Biology',
			url: 'https://www.ucf.edu/degree/biomedical-sciences-ms/cancer-biology/',
		},
		{
			id: 64874,
			title: 'Biomedical Sciences (MS) – Infectious Disease',
			url: 'https://www.ucf.edu/degree/biomedical-sciences-ms/infectious-disease/',
		},
		{
			id: 64875,
			title: 'Biomedical Sciences (MS) – Integrated Medical Sciences Track',
			url: 'https://www.ucf.edu/degree/biomedical-sciences-ms/integrated-medical-sciences-track/',
		},
		{
			id: 84380,
			title: 'Biomedical Sciences (MS) – Master’s Along The Way Track',
			url: 'https://www.ucf.edu/degree/biomedical-sciences-ms/along-the-way-track/',
		},
		{
			id: 64876,
			title: 'Biomedical Sciences (MS) – Metabolic & Cardiovascular Science',
			url: 'https://www.ucf.edu/degree/biomedical-sciences-ms/metabolic-cardiovascular-science/',
		},
		{
			id: 64877,
			title: 'Biomedical Sciences (MS) – Neuroscience',
			url: 'https://www.ucf.edu/degree/biomedical-sciences-ms/neuroscience/',
		},
	],
	'master/computer-and-information-sciences-general': [
		{
			id: 61189,
			title: 'Computer Science (MS)',
			url: 'https://www.ucf.edu/degree/computer-science-ms/',
		},
		{
			id: 64744,
			title: 'Computer Science (MS) – Accelerated BS to MS',
			url: 'https://www.ucf.edu/degree/computer-science-ms/accelerated-bs-to-ms/',
		},
		{
			id: 72049,
			title: 'Computer Vision (MS)',
			url: 'https://www.ucf.edu/degree/computer-vision-ms/',
		},
		{
			id: 61213,
			title: 'Digital Forensics (MS)',
			url: 'https://www.ucf.edu/degree/digital-forensics-ms/',
		},
	],
	'master/computer-engineering': [
		{
			id: 61179,
			title: 'Computer Engineering (MSPE)',
			url: 'https://www.ucf.edu/degree/computer-engineering-mspe/',
		},
		{
			id: 64903,
			title: 'Computer Engineering (MSPE) – Accelerated BSCpE to MSPE',
			url: 'https://www.ucf.edu/degree/computer-engineering-mspe/accelerated-bscpe-to-mspe/',
		},
	],
	'master/film-video-and-photographic-arts': [
		{
			id: 74031,
			title: 'Feature Film Production (MFA)',
			url: 'https://www.ucf.edu/degree/feature-film-production-mfa/',
		},
	],
	'master/mechanical-engineering': [
		{
			id: 61348,
			title: 'Mechanical Engineering (MSME)',
			url: 'https://www.ucf.edu/degree/mechanical-engineering-msme/',
		},
		{
			id: 64325,
			title: 'Mechanical Engineering (MSME) – Accelerated BS to MSME',
			url: 'https://www.ucf.edu/degree/mechanical-engineering-msme/accelerated-bs-to-msme/',
		},
		{
			id: 92575,
			title: 'Mechanical Engineering (MSME) – Advanced Manufacturing Track',
			url: 'https://www.ucf.edu/degree/mechanical-engineering-msme/advanced-manufacturing-track/',
		},
		{
			id: 69923,
			title: 'Mechanical Engineering (MSME) – Guidance Control and Dynamics',
			url: 'https://www.ucf.edu/degree/mechanical-engineering-msme/guidance-control-and-dynamics/',
		},
		{
			id: 64326,
			title: 'Mechanical Engineering (MSME) – Mechanical Systems',
			url: 'https://www.ucf.edu/degree/mechanical-engineering-msme/mechanical-systems/',
		},
		{
			id: 94861,
			title: 'Mechanical Engineering (MSME) – Sustainable Energy Systems Track',
			url: 'https://www.ucf.edu/degree/mechanical-engineering-msme/sustainable-energy-systems-track/',
		},
		{
			id: 64327,
			title: 'Mechanical Engineering (MSME) – Thermofluids',
			url: 'https://www.ucf.edu/degree/mechanical-engineering-msme/thermofluids/',
		},
	],
	'master/psychology-general': [
		{
			id: 61299,
			title: 'Human Factors and Cognitive Psychology (MA)',
			url: 'https://www.ucf.edu/degree/psychology-phd/human-factors-cognitive-psychology/',
		},
		{
			id: 88161,
			title: 'Human Factors and Cognitive Psychology (MA) – Master’s Along the Way Track',
			url: 'https://www.ucf.edu/degree/applied-experimental-and-human-factors-psychology-ma/masters-along-the-way-track/',
		},
	],
	'master/registered-nursing-nursing-administration-nursing-research-and-clinical-nursing':
		[
			{
				id: 61377,
				title: 'Nursing (MSN)',
				url: 'https://www.ucf.edu/degree/nursing-msn/',
			},
			{
				id: 64348,
				title: 'Nursing (MSN) – Nurse Educator',
				url: 'https://www.ucf.edu/degree/nursing-msn/nurse-educator/',
			},
			{
				id: 64345,
				title: 'Nursing (MSN) – Nursing Leadership and Management',
				url: 'https://www.ucf.edu/degree/nursing-msn/nursing-leadership-and-management/',
			},
		],
	'doctorate/biology-general': [
		{
			id: 61148,
			title: 'Biomedical Sciences (PhD)',
			url: 'https://www.ucf.edu/degree/biomedical-sciences-phd/',
		},
		{
			id: 64872,
			title: 'Biomedical Sciences (PhD) – MD/PhD Track',
			url: 'https://www.ucf.edu/degree/biomedical-sciences-phd/md-phd-track/',
		},
	],
	'doctorate/computer-and-information-sciences-general': [
		{
			id: 61190,
			title: 'Computer Science (PhD)',
			url: 'https://www.ucf.edu/degree/computer-science-phd/',
		},
		{
			id: 85072,
			title: 'Computer Science (PhD) – Post-Master’s Track',
			url: 'https://www.ucf.edu/degree/computer-science-phd/post-masters-track/',
		},
	],
	'doctorate/computer-engineering': [
		{
			id: 61177,
			title: 'Computer Engineering  (PhD)',
			url: 'https://www.ucf.edu/degree/computer-engineering-phd/',
		},
		{
			id: 88003,
			title: 'Computer Engineering (PhD) – Post-Master’s Track',
			url: 'https://www.ucf.edu/degree/computer-engineering-phd/computer-engineering-phd-post-masters-track/',
		},
	],
	'doctorate/mechanical-engineering': [
		{
			id: 61349,
			title: 'Mechanical Engineering (PhD)',
			url: 'https://www.ucf.edu/degree/mechanical-engineering-phd/',
		},
		{
			id: 85078,
			title: 'Mechanical Engineering (PhD) – Post-Master’s Track',
			url: 'https://www.ucf.edu/degree/mechanical-engineering-phd/post-masters-track/',
		},
	],
	'doctorate/psychology-general': [
		{
			id: 61402,
			title: 'Psychology (PhD)',
			url: 'https://www.ucf.edu/degree/psychology-phd/',
		},
		{
			id: 64797,
			title: 'Psychology (PhD) – Clinical',
			url: 'https://www.ucf.edu/degree/psychology-phd/clinical/',
		},
		{
			id: 64798,
			title: 'Psychology (PhD) – Human Factors & Cognitive Psychology',
			url: 'https://www.ucf.edu/degree/psychology-phd/human-factors-cognitive-psychology/',
		},
		{
			id: 64799,
			title: 'Psychology (PhD) – Industrial and Organizational',
			url: 'https://www.ucf.edu/degree/psychology-phd/industrial-and-organizational/',
		},
	],
	'doctorate/registered-nursing-nursing-administration-nursing-research-and-clinical-nursing':
		[
			{
				id: 86581,
				title: 'Doctor of Nursing Practice (DNP)',
				url: 'https://www.ucf.edu/degree/doctor-of-nursing-practice-dnp/',
			},
			{
				id: 97820,
				title: 'Doctor of Nursing Practice (DNP) – Adult-Gerontology Acute Care Nurse Practitioner',
				url: 'https://www.ucf.edu/degree/doctor-of-nursing-practice-dnp/adult-gerontology-acute-care-nurse-practitioner/',
			},
			{
				id: 97943,
				title: 'Doctor of Nursing Practice (DNP) – Adult-Gerontology Acute Care Nurse Practitioner',
				url: 'https://www.ucf.edu/degree/doctor-of-nursing-practice-dnp-2/adult-gerontology-acute-care-nurse-practitioner/',
			},
			{
				id: 97941,
				title: 'Doctor of Nursing Practice (DNP) – Adult-Gerontology Primary Care Nurse Practitioner',
				url: 'https://www.ucf.edu/degree/doctor-of-nursing-practice-dnp-2/adult-gerontology-primary-care-nurse-practitioner/',
			},
			{
				id: 97819,
				title: 'Doctor of Nursing Practice (DNP) – Advanced Practice DNP',
				url: 'https://www.ucf.edu/degree/doctor-of-nursing-practice-dnp/advanced-practice-dnp/',
			},
			{
				id: 97942,
				title: 'Doctor of Nursing Practice (DNP) – Advanced Practice DNP',
				url: 'https://www.ucf.edu/degree/doctor-of-nursing-practice-dnp-2/advanced-practice-dnp/',
			},
			{
				id: 97821,
				title: 'Doctor of Nursing Practice (DNP) – ARNP Post Master’s',
				url: 'https://www.ucf.edu/degree/doctor-of-nursing-practice-dnp/arnp-post-masters/',
			},
			{
				id: 97944,
				title: 'Doctor of Nursing Practice (DNP) – ARNP Post Master’s',
				url: 'https://www.ucf.edu/degree/doctor-of-nursing-practice-dnp-2/arnp-post-masters/',
			},
			{
				id: 86590,
				title: 'Doctor of Nursing Practice (DNP) – Executive',
				url: 'https://www.ucf.edu/degree/doctor-of-nursing-practice-dnp/executive/',
			},
			{
				id: 97822,
				title: 'Doctor of Nursing Practice (DNP) – Family Nurse Practitioner',
				url: 'https://www.ucf.edu/degree/doctor-of-nursing-practice-dnp/family-nurse-practitioner/',
			},
			{
				id: 97945,
				title: 'Doctor of Nursing Practice (DNP) – Family Nurse Practitioner',
				url: 'https://www.ucf.edu/degree/doctor-of-nursing-practice-dnp-2/family-nurse-practitioner/',
			},
			{
				id: 61378,
				title: 'Nursing (PhD)',
				url: 'https://www.ucf.edu/degree/nursing-phd/',
			},
			{
				id: 64349,
				title: 'Nursing (PhD) – BSN to PhD',
				url: 'https://www.ucf.edu/degree/nursing-phd/bsn-to-phd/',
			},
		],
};
