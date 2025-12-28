import React from 'react';
import PropTypes from 'prop-types';
import YearDisplay from './YearDisplay';
import HeaderTitle from './HeaderTitle';
import LanguageToggle from './LanguageToggle';

const Header = ({ year }) => {
  return (
    <header className="mb-4 flex flex-col md:flex-row justify-between items-center gap-4 glass-panel-light p-4 rounded-2xl">
      <HeaderTitle />
      
      <div className="flex items-center gap-4">
          <LanguageToggle />
          {/* YearDisplay is the only dynamic part that updates on animation tick */}
          <YearDisplay year={year} />
      </div>
    </header>
  );
};

Header.propTypes = {
  year: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
};

// Optimization: Memoize to prevent re-renders when parent re-renders but props are same.
export default React.memo(Header);
