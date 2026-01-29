import React, { useState, useEffect, useRef } from 'react';
import { MdFilterList, MdClose, MdCheck } from 'react-icons/md';
import { FaChevronDown, FaSortAmountDown } from 'react-icons/fa';
import './DashboardFilters.css';

const FilterDropdown = ({ label, options, activeValues, onToggle, isOpen, setIsOpen }) => {
    const dropdownRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [setIsOpen]);

    return (
        <div className="filter-dropdown-container" ref={dropdownRef}>
            <button
                className={`filter-dropdown-trigger ${activeValues.length > 0 ? 'active' : ''}`}
                onClick={() => setIsOpen(!isOpen)}
            >
                {label}
                {activeValues.length > 0 && <span className="filter-count-badge">{activeValues.length}</span>}
                <FaChevronDown className={`dropdown-arrow ${isOpen ? 'open' : ''}`} />
            </button>

            {isOpen && (
                <div className="filter-dropdown-menu">
                    {options.map(option => (
                        <div
                            key={option}
                            className={`dropdown-item ${activeValues.includes(option) ? 'selected' : ''}`}
                            onClick={() => onToggle(option)}
                        >
                            <span className="checkbox-custom">
                                {activeValues.includes(option) && <MdCheck />}
                            </span>
                            <span className="item-text">{option}</span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

const DashboardFilters = ({ projects, onFilterChange }) => {
    const [activeFilters, setActiveFilters] = useState({ priority: [], status: [], projectId: [] });

    // Dropdown visibility states
    const [openDropdown, setOpenDropdown] = useState(null); // 'priority', 'status', or null

    const toggleFilter = (category, value) => {
        const current = activeFilters[category];
        const newFilters = { ...activeFilters };

        if (current.includes(value)) {
            newFilters[category] = current.filter(item => item !== value);
        } else {
            newFilters[category] = [...current, value];
        }

        setActiveFilters(newFilters);
        onFilterChange(newFilters);
    };

    const clearFilters = () => {
        const reset = { priority: [], status: [], projectId: [] };
        setActiveFilters(reset);
        onFilterChange(reset);
        setOpenDropdown(null);
    };

    const hasActiveFilters = Object.values(activeFilters).some(arr => arr.length > 0);

    return (
        <div className="dashboard-filters">
            <div className="filters-left">
                <div className="filter-icon">
                    <MdFilterList size={20} />
                    <span className="filter-text">Filters</span>
                </div>

                <div className="divider-vertical"></div>

                <FilterDropdown
                    label="Priority"
                    options={['High', 'Medium', 'Low']}
                    activeValues={activeFilters.priority}
                    onToggle={(val) => toggleFilter('priority', val)}
                    isOpen={openDropdown === 'priority'}
                    setIsOpen={(val) => setOpenDropdown(val ? 'priority' : null)}
                />

                <FilterDropdown
                    label="Status"
                    options={['To Do', 'In Progress', 'Done']}
                    activeValues={activeFilters.status}
                    onToggle={(val) => toggleFilter('status', val)}
                    isOpen={openDropdown === 'status'}
                    setIsOpen={(val) => setOpenDropdown(val ? 'status' : null)}
                />
            </div>

            {hasActiveFilters && (
                <button className="clear-filters-btn" onClick={clearFilters}>
                    <MdClose /> Clear All
                </button>
            )}
        </div>
    );
};

export default DashboardFilters;
