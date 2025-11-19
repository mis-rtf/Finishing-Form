document.addEventListener('DOMContentLoaded', () => {
  const departmentRole = document.getElementById('departmentRole');
  const workType = document.getElementById('worktype');
  const totalPicsContainer = document.getElementById('totalPicsContainer');

  const passAlterContainer = document.createElement('div');
  passAlterContainer.id = 'passAlterContainer';
  passAlterContainer.style.display = 'none';
  passAlterContainer.innerHTML = `
  <div id="passPcsGroup">
    <label for="passPcs">Pass Pcs:</label>
    <input type="number" id="passPcs" name="passPcs" style="margin-bottom: 8px;"><br>
  </div>

  <div id="alterPcsGroup">
    <label for="alterPcs">Alter Pcs:</label>
    <input type="number" id="alterPcs" name="alterPcs" style="margin-bottom: 8px;"><br>
  </div>

  <div id="totalPicsGroup">
    <label for="totalPics">Total Pcs:</label>
    <input type="number" id="totalPics" name="totalPics" style="margin-bottom: 8px;"><br>
  </div>
`;


  const workTypeField = document.getElementById('worktype');
  workTypeField.parentNode.insertBefore(passAlterContainer, workTypeField.nextSibling);

  function selectWorkTypeByLabel(labelText) {
    const options = workType.options;
    for (let i = 0; i < options.length; i++) {
      if (options[i].text.trim().toLowerCase() === labelText.trim().toLowerCase()) {
        workType.selectedIndex = i;
        break;
      }
    }
  }

  departmentRole.addEventListener('change', function () {
  const selectedRole = departmentRole.value;

  passAlterContainer.style.display = 'block';

  const passPcsGroup = document.getElementById('passPcsGroup');
  const alterPcsGroup = document.getElementById('alterPcsGroup');
  const totalPicsGroup = document.getElementById('totalPicsGroup');

  if (selectedRole === 'threadCutter') {
    selectWorkTypeByLabel('Thread Cutting');
    passPcsGroup.style.display = 'none';
    alterPcsGroup.style.display = 'none';
    totalPicsGroup.style.display = 'block';
  } else if (
    selectedRole === 'initialChecker' ||
    selectedRole === 'finalchecker' ||
    selectedRole === 'RefinalChecker'
  ) {
    selectWorkTypeByLabel('Garment Checking');
    passPcsGroup.style.display = 'block';
    alterPcsGroup.style.display = 'block';
    totalPicsGroup.style.display = 'block';
  } else if (selectedRole === 'alterman') {
    selectWorkTypeByLabel('Part Change/Repair/Other');
    passPcsGroup.style.display = 'none';
    alterPcsGroup.style.display = 'none';
    totalPicsGroup.style.display = 'block';
  } else {
    workType.selectedIndex = 0;
    passAlterContainer.style.display = 'none';
  }
});

  const form = document.getElementById('finishingForm');

  // ✅ Web App URLs
  const POST_URL = 'https://script.google.com/macros/s/AKfycbzPVu9jmABvNeDnhh9NN6Vy0W2xuONf087tPaTVZ1QLnAB3m2UbmZl1AnASl_nRCbli/exec';
  const LOOKUP_URL = 'https://script.google.com/macros/s/AKfycbwTYc7KMs530d--1cxzyXkIoYWuZToa1k9LzkHUdI3WSUXCW-KBH_Cz4TCioDhNMZ7t/exec';

  // ✅ RTF logic: auto-fill style and filter color dropdown
  const rtfField = document.getElementById('rtf');
  const styleField = document.getElementById('styleno');
  const colorDropdown = document.getElementById('color');

  rtfField.addEventListener('blur', async () => {
    const rtfValue = rtfField.value.trim();
    if (!rtfValue) return;

    // Show loading indicators
    styleField.value = 'Loading...';
    colorDropdown.innerHTML = '';
    const loadingOption = document.createElement('option');
    loadingOption.textContent = 'Loading...';
    loadingOption.disabled = true;
    loadingOption.selected = true;
    colorDropdown.appendChild(loadingOption);

    try {
      const res = await fetch(`${LOOKUP_URL}?lastDigits=${encodeURIComponent(rtfValue)}`);
      const data = await res.json();

      rtfField.value = data.rtf || rtfValue; // Fill full RTF
      styleField.value = data.style || '';

      styleField.value = data.style || '';

      colorDropdown.innerHTML = '';
      if (data.colors.length > 0) {
        data.colors.forEach(color => {
          const option = document.createElement('option');
          option.value = color;
          option.textContent = color;
          colorDropdown.appendChild(option);
        });
      } else {
        const option = document.createElement('option');
        option.value = '';
        option.textContent = 'No colors found';
        colorDropdown.appendChild(option);
      }
    } catch (err) {
      styleField.value = '';
      colorDropdown.innerHTML = '';
      const errorOption = document.createElement('option');
      errorOption.textContent = 'Error loading colors';
      errorOption.disabled = true;
      colorDropdown.appendChild(errorOption);
      console.error('RTF lookup failed:', err);
    }
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const payload = {
      workDate: document.getElementById('workDate').value,
      employeeName: document.getElementById('employeeName').value,
      rtf: rtfField.value,
      styleno: styleField.value,
      color: colorDropdown.value,
      departmentRole: departmentRole.value,
      worktype: workType.value,
      totalPics: document.getElementById('totalPics')?.value || '',
      passPcs: document.getElementById('passPcs')?.value || '',
      alterPcs: document.getElementById('alterPcs')?.value || '',
      remark: document.getElementById('remark').value
    };

    console.log("Submitting payload:", payload);

    try {
      const submitBtn = document.getElementById('submit');
      submitBtn.disabled = true;

      await fetch(POST_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      // ✅ Countdown logic
      let count = 1;
      submitBtn.textContent = `Submitted! Showing countdown: ${count}`;
      const countdown = setInterval(() => {
        count++;
        if (count <= 5) {
          submitBtn.textContent = `Submitted! Showing countdown: ${count}`;
        } else {
          clearInterval(countdown);
          submitBtn.textContent = 'Submit';
          submitBtn.disabled = false;

          alert('✅ Data submitted successfully!');
          form.reset();
          totalPicsContainer.style.display = 'none';
          passAlterContainer.style.display = 'none';
          workType.selectedIndex = 0;
          departmentRole.selectedIndex = 0;
        }
      }, 1000);

    } catch (err) {
      alert('⚠️ Request failed: ' + err.message);
    }
  });
});
