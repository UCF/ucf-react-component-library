/** The Card's editor view: its sidebar and its content, from its definition. */
import { blockEdit } from '../../../../../integrations/wp/block.tsx';
import { card } from '../../Card.definition.ts';
import metadata from './block.json';

export default blockEdit( card, metadata );
