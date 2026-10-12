import React, {useMemo} from 'react';

import OptionSheet from './OptionSheet';

/**
 * Branch switcher sheet.
 *
 * `branches` comes from /branches — already limited to what the user may see,
 * so anything listed here is safe to select. `null` means "all my branches".
 */
const BranchPicker = ({visible, branches = [], selected, onSelect, onClose}) => {
  const options = useMemo(
    () => [
      {
        key: null,
        label: 'All my branches',
        caption: `${branches.length} branch${
          branches.length === 1 ? '' : 'es'
        } combined`,
      },
      ...branches.map(branch => ({
        key: branch.code,
        label: branch.name,
        code: branch.code,
        caption: branch.departments?.length
          ? branch.departments.join(' · ')
          : 'All departments',
      })),
    ],
    [branches],
  );

  return (
    <OptionSheet
      visible={visible}
      title="Switch branch"
      subtitle="Showing data for the branch you pick."
      options={options}
      selected={selected}
      onSelect={onSelect}
      onClose={onClose}
    />
  );
};

export default BranchPicker;
