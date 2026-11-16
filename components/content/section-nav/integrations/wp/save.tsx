/**
 * CONTEXT: the markup the block saves.
 * SYNC: saved in every post; changing it needs a deprecation in index.tsx.
 */
import { blockSave } from '@/integrations/wp/block';
import SectionNav from '../../SectionNav.tsx';

export default blockSave( SectionNav );
