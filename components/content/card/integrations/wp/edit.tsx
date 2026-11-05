/** The Card's editor view: its sidebar and its content, from its port. */
import { blockEdit } from '../../../../../integrations/wp/block.tsx';
import Card from '../../Card.tsx';
import metadata from './block.json';

export default blockEdit( Card, metadata );
