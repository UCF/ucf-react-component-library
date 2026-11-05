/** The Card's block, made from its definition (integrations/wp/register.tsx). */
// WHY imported here: webpack builds the block's stylesheet from what its script imports.
import '../../../../primitives/image/style.css';
import '../../style.css';
import { registerComponent } from '../../../../../integrations/wp/register.tsx';
import { card } from '../../Card.definition.ts';
import metadata from './block.json';

registerComponent( card, metadata );
