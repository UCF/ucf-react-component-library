import { useEffect, useRef, useState, type ReactNode } from 'react';
import { exitDuration } from '../utils/motion.ts';

interface PresenceProps {
	show: boolean;
	children: ReactNode;
}

/**
 * Animates something in when `show` turns on, and out when it turns
 * off, keeping it on the page until the exit animation finishes. While
 * leaving it shows its last content, so a button doesn't lose its
 * label mid-fade.
 *
 * @param props          Its props.
 * @param props.show     Whether the children should be on the page.
 * @param props.children What comes and goes.
 */
export default function Presence( { show, children }: PresenceProps ) {
	const [ mounted, setMounted ] = useState( show );
	const lastChildren = useRef< ReactNode >( children );

	if ( show ) {
		lastChildren.current = children;
	}

	useEffect( () => {
		if ( show ) {
			setMounted( true );
			return undefined;
		}

		const timer = setTimeout( () => setMounted( false ), exitDuration() );
		return () => clearTimeout( timer );
	}, [ show ] );

	if ( ! show && ! mounted ) {
		return null;
	}

	return (
		<span
			className={ `ucf-c-degree-finder__presence ucf-c-degree-finder__motion${ show ? '' : ' ucf-c-degree-finder__motion--exit' }` }
			aria-hidden={ show ? undefined : true }
		>
			{ show ? children : lastChildren.current }
		</span>
	);
}
