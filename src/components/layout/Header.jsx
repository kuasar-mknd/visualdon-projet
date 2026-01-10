import React from 'react';
import PropTypes from 'prop-types';
import YearDisplay from './YearDisplay';
import HeaderContent from './HeaderContent';

const Header = ({ year }) => {
  return (
    <header className="mb-4 flex flex-col md:flex-row justify-between items-center gap-4 glass-panel-light p-4 rounded-2xl">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 w-full">
         <div className="flex-1 flex flex-col md:flex-row justify-between items-center gap-4 w-full">
            <HeaderContent />
            <YearDisplay year={year} />
         </div>
      </div>
    </header>
  );
};

Header.propTypes = {
  year: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
};

// Optimization: Memoize to prevent re-renders when parent re-renders but props are same.
export default React.memo(Header);
