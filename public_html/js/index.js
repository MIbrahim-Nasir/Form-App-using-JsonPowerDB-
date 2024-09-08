const $rollNoField = $('#rollNo');
const $fullNameField = $('#fullName');
const $classField = $('#class');
const $birthDateField = $('#birthDate');
const $addressField = $('#address');
const $enrollmentDateField = $('#enrollmentDate');
const $saveButton = $('#saveButton');
const $updateButton = $('#updateButton');
const $resetButton = $('#resetButton');
let isExistingRecord = false;
let currentRecordId = null;  // To store the ID of the record being updated

var jpdbBaseUrl = "http://api.login2explore.com:5577";
var jpdbIRL = "/api/irl";
var jpdbIML = "/api/iml";
var studentDBName = "SCHOOL-DB";
var studentRelationName = "STUDENT-TABLE";
var connToken = "90932053|-31949220116472830|90962321";

disableForm();

// Function to check if record exists and act accordingly
function checkRecord() {
    const rollNo = $rollNoField.val();
    if (!rollNo) {
        console.log("Roll No field is empty, disabling the form.");
        disableForm();
        return;
    }

    const requestJson = { RollNo: rollNo };
    const getRequest = createGET_BY_KEYRequest(connToken, studentDBName, studentRelationName, JSON.stringify(requestJson));

    console.log("GET request for Roll No:", rollNo);  // Log the request for debugging

    // Execute the command
    jQuery.ajaxSetup({ async: false });
    var resultObj = executeCommandAtGivenBaseUrl(getRequest, jpdbBaseUrl, jpdbIRL);
    jQuery.ajaxSetup({ async: true });

    console.log("Result object:", resultObj);

    if (resultObj.status === 200) {
        const studentData = JSON.parse(resultObj.data).record;
        console.log("Record found:", studentData);

        // Populate the fields with the data
        $fullNameField.val(studentData.FullName);
        $classField.val(studentData.Class);
        $birthDateField.val(studentData.BirthDate);
        $addressField.val(studentData.Address);
        $enrollmentDateField.val(studentData.EnrollmentDate);

        // Store the record ID for updating
        currentRecordId = JSON.parse(resultObj.data).rec_no;

        // Disable Roll No field and enable rest for update
        $rollNoField.prop('disabled', true);
        enableFormForUpdate();
        isExistingRecord = true;
    } else if (resultObj.status === 400) {
        console.log("No record found, enabling form for new entry.");
        enableFormForSave();
        isExistingRecord = false;
        currentRecordId = null;  // Clear the record ID if no record found
    } else {
        console.log("Error: " + resultObj.message);
        alert("Error fetching data: " + resultObj.message);
    }
}

// Function to enable the form for saving a new record
function enableFormForSave() {
    $fullNameField.prop('disabled', false);
    $classField.prop('disabled', false);
    $birthDateField.prop('disabled', false);
    $addressField.prop('disabled', false);
    $enrollmentDateField.prop('disabled', false);
    $saveButton.prop('disabled', false);
    $updateButton.prop('disabled', true);
    $resetButton.prop('disabled', false);
}

// Function to enable the form for updating an existing record
function enableFormForUpdate() {
    $fullNameField.prop('disabled', false);
    $classField.prop('disabled', false);
    $birthDateField.prop('disabled', false);
    $addressField.prop('disabled', false);
    $enrollmentDateField.prop('disabled', false);
    $saveButton.prop('disabled', true);
    $updateButton.prop('disabled', false);
    $resetButton.prop('disabled', false);
    $rollNoField.prop('disabled', true);
}

// Function to disable the form fields
function disableForm() {
    $fullNameField.prop('disabled', true);
    $classField.prop('disabled', true);
    $birthDateField.prop('disabled', true);
    $addressField.prop('disabled', true);
    $enrollmentDateField.prop('disabled', true);
    $saveButton.prop('disabled', true);
    $updateButton.prop('disabled', true);
    $resetButton.prop('disabled', true);
}

// Validate and collect form data
function validateAndGetFormData() {
    const rollNo = $rollNoField.val();
    if (!rollNo) {
        alert("Roll No is required");
        return null;
    }

    const fullName = $fullNameField.val();
    const studentClass = $classField.val();
    const birthDate = $birthDateField.val();
    const address = $addressField.val();
    const enrollmentDate = $enrollmentDateField.val();

    if (!fullName || !studentClass || !birthDate || !address || !enrollmentDate) {
        alert("All fields must be filled.");
        return null;
    }

    return JSON.stringify({
        RollNo: rollNo,
        FullName: fullName,
        Class: studentClass,
        BirthDate: birthDate,
        Address: address,
        EnrollmentDate: enrollmentDate
    });
}

// Reset the form and disable fields
function resetForm() {
    $rollNoField.val("");
    $fullNameField.val("");
    $classField.val("");
    $birthDateField.val("");
    $addressField.val("");
    $enrollmentDateField.val("");
    disableForm();
    $rollNoField.prop('disabled', false);
}

// Save new student record
function saveStudent() {
    const jsonStr = validateAndGetFormData();
    if (!jsonStr) return;

    var putRequest = createPUTRequest(connToken, jsonStr, studentDBName, studentRelationName);
    jQuery.ajaxSetup({ async: false });
    var resultObj = executeCommandAtGivenBaseUrl(putRequest, jpdbBaseUrl, jpdbIML);
    jQuery.ajaxSetup({ async: true });
    console.log("Save result:", resultObj);  // Log the result for debugging
    alert(JSON.stringify(resultObj));
    resetForm();
}

// Update an existing student record
function updateStudent() {
    if (currentRecordId === null) {
        alert("No record selected for update.");
        return;
    }

    const jsonStr = validateAndGetFormData();
    if (!jsonStr) return;

    const updateRequest = createUPDATERecordRequest(connToken, jsonStr, studentDBName, studentRelationName, currentRecordId);
    jQuery.ajaxSetup({ async: false });
    var resultObj = executeCommandAtGivenBaseUrl(updateRequest, jpdbBaseUrl, jpdbIML);
    jQuery.ajaxSetup({ async: true });
    console.log("Update result:", resultObj);  // Log the result for debugging
    if (resultObj.status === 200) {
        alert("Record updated successfully.");
    } else {
        alert("Error updating record: " + resultObj.message);
    }
    resetForm();
}

// Event listeners
$saveButton.on('click', saveStudent);
$updateButton.on('click', updateStudent);
$resetButton.on('click', resetForm);

// When Roll No field is changed, check if the record exists
$rollNoField.on('change', checkRecord);
