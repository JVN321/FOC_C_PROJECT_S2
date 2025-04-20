/**
 * Feedback dashboard functionality
 */
document.addEventListener('DOMContentLoaded', function() {
    // Check if user is logged in
    if (!sessionStorage.getItem('isLoggedIn')) {
        window.location.href = 'login.html';
        return;
    }

    const feedbackList = document.getElementById('feedback-list');
    let allFeedbackData = [];
    
    // Get filter elements
    const typeFilter = document.getElementById('typeFilter');
    const departmentFilter = document.getElementById('departmentFilter');
    const semesterFilter = document.getElementById('semesterFilter');
    const branchFilter = document.getElementById('branchFilter');
    const dateFilter = document.getElementById('dateFilter');
    const searchBar = document.querySelector('.search-bar');

    function updateFilters(data) {
        // Get unique values for departments and branches
        const departments = [...new Set(data.map(item => item.department))].filter(Boolean);
        const branches = [...new Set(data.map(item => item.branch))].filter(Boolean);

        // Populate department filter
        departments.forEach(dept => {
            const option = new Option(dept, dept);
            departmentFilter.add(option);
        });

        // Populate branch filter
        branches.forEach(branch => {
            const option = new Option(branch, branch);
            branchFilter.add(option);
        });
    }

    function applyFilters() {
        let filteredData = allFeedbackData;

        // Apply type filter
        if (typeFilter.value) {
            filteredData = filteredData.filter(item => item.type === typeFilter.value);
        }

        // Apply department filter
        if (departmentFilter.value) {
            filteredData = filteredData.filter(item => item.department === departmentFilter.value);
        }

        // Apply semester filter
        if (semesterFilter.value) {
            filteredData = filteredData.filter(item => item.semester === semesterFilter.value);
        }

        // Apply branch filter
        if (branchFilter.value) {
            filteredData = filteredData.filter(item => item.branch === branchFilter.value);
        }

        // Apply date filter
        if (dateFilter.value) {
            const filterDate = dateFilter.value;
            filteredData = filteredData.filter(item => item.date && item.date.startsWith(filterDate));
        }

        // Apply search filter
        if (searchBar.value) {
            const searchTerm = searchBar.value.toLowerCase();
            filteredData = filteredData.filter(item => 
                Object.values(item).some(val => 
                    val && val.toString().toLowerCase().includes(searchTerm)
                )
            );
        }

        renderFeedbackList(filteredData);
    }

    function renderFeedbackList(data) {
        feedbackList.innerHTML = '';
        
        if (!data || data.length === 0) {
            feedbackList.innerHTML = '<tr><td colspan="9" style="text-align: center;">No feedback records found.</td></tr>';
            return;
        }
        
        data.forEach((item, index) => {
            const mainRow = document.createElement('tr');
            mainRow.className = 'feedback-row';
            mainRow.dataset.index = index;
            
            mainRow.innerHTML = `
                <td>${item.type === 'hostel' ? 'H' : 'C'}</td>
                <td><span class="status-dot"></span>${item.subject || 'Feedback'}</td>
                <td>${item.name || 'Anonymous'}</td>
                <td>${item.branch || '-'}</td>
                <td>${item.semester || '-'}</td>
                <td>${item.department || '-'}</td>
                <td>${item.date || '-'}</td>
                <td class="truncate">${truncateText(item.feedback) || 'No content'}</td>
            `;

            const expandedRow = document.createElement('tr');
            expandedRow.className = 'expanded-row';
            expandedRow.innerHTML = `
                <td colspan="8">
                    <div class="expanded-content">
                        <p>${item.feedback}</p>
                    </div>
                </td>
            `;

            feedbackList.appendChild(mainRow);
            feedbackList.appendChild(expandedRow);

            mainRow.addEventListener('click', () => toggleExpand(index));
        });
    }

    function toggleExpand(index) {
        const expandedRows = document.querySelectorAll('.expanded-row');
        expandedRows.forEach((row, i) => {
            if (i === index) {
                row.style.display = row.style.display === 'table-row' ? 'none' : 'table-row';
            } else {
                row.style.display = 'none';
            }
        });
    }

    function markAsSolved(index) {
        allFeedbackData[index].status = 'solved';
        updateFeedback(index);
    }

    function markAsPending(index) {
        allFeedbackData[index].status = 'pending';
        updateFeedback(index);
    }

    function deleteFeedback(index) {
        if (confirm('Are you sure you want to delete this feedback?')) {
            allFeedbackData.splice(index, 1);
            applyFilters();
        }
    }

    function updateFeedback(index) {
        // Here you would typically make an API call to update the status
        // For now, we'll just update the UI
        applyFilters();
    }

    function truncateText(text, maxLength = 50) {
        if (!text) return '';
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength) + '...';
    }

    // Add event listeners to filters
    [typeFilter, departmentFilter, semesterFilter, branchFilter, dateFilter].forEach(filter => {
        filter.addEventListener('change', applyFilters);
    });
    searchBar.addEventListener('input', applyFilters);

    // Fetch and initialize data
    fetch('cgi-bin/c_program.cgi?action=list')
        .then(response => response.text())
        .then(text => {
            if (text.trim() === '') return [];
            try {
                let jsonText = text.trim();
                if (jsonText === '{}') return [];
                return JSON.parse('[' + jsonText + ']');
            } catch (e) {
                throw new Error(`Failed to parse JSON: ${e.message}`);
            }
        })
        .then(data => {
            allFeedbackData = data;
            updateFilters(data);
            renderFeedbackList(data);
        })
        .catch(error => {
            feedbackList.innerHTML = `
                <tr>
                    <td colspan="9" style="text-align: center; color: #b71c1c;">
                        Error loading feedback: ${error.message}
                    </td>
                </tr>
            `;
            console.error('Error loading feedback:', error);
        });
});