// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/// @title Maid Finder Platform
/// @notice Employers hire maids with escrow payments
/// @dev Simple ETH escrow + role restrictions

contract MaidFinder {
    // --------------------
    // Structs
    // --------------------
    struct Maid {
        address wallet;
        string ipfsHash; // Maid profile stored on IPFS
        bool verified;
        bool exists;
        uint createAt;   // When maid registered
    }

    enum JobStatus {
        Created,
        Active,
        Completed,
        Paid,
        Cancelled
    }

    struct Job {
        uint jobId;
        string ipfsHash; // Job details stored on IPFS
        address maid;
        address employer;
        JobStatus status;
        uint amount;
        bool employerMarked;
        bool maidConfirmed;
        uint createAt;   // When job was created
        uint updatedAt;  // Last updated (status change)
    }

    // --------------------
    // State Variables
    // --------------------
    address public admin;
    uint public jobCount;

    mapping(address => Maid) public maids;
    mapping(uint => Job) public jobs;

    // --------------------
    // Events
    // --------------------
    event MaidRegistered(address maid, string ipfsHash, uint createAt);
    event MaidVerified(address maid, bool status);
    event JobCreated(uint jobId, address maid, address employer, uint amount, uint createAt);
    event EmployerMarked(uint jobId, address employer, uint updatedAt);
    event MaidMarked(uint jobId, address maid, uint updatedAt);
    event FundReleased(uint jobId, address maid, uint amount);
    event JobCancelled(uint jobId, uint updatedAt);

    // --------------------
    // Constructor
    // --------------------
    constructor() {
        admin = msg.sender;
    }

    // --------------------
    // Modifiers
    // --------------------
    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin");
        _;
    }

    modifier onlyMaid(uint jobId) {
        require(msg.sender == jobs[jobId].maid, "Only assigned maid");
        _;
    }

    modifier onlyEmployer(uint jobId) {
        require(msg.sender == jobs[jobId].employer, "Only employer");
        _;
    }

    // --------------------
    // Maid Functions
    // --------------------
    function registerMaid(string calldata ipfsHash) external {
        require(!maids[msg.sender].exists, "Maid already registered");
        require(bytes(ipfsHash).length > 0, "IPFS hash required");
        require(msg.sender != admin, "Admin cannot be maid");

        maids[msg.sender] = Maid({
            wallet: msg.sender,
            ipfsHash: ipfsHash,
            verified: false,
            exists: true,
            createAt: block.timestamp
        });

        emit MaidRegistered(msg.sender, ipfsHash, block.timestamp);
    }

    function verifyMaid(address maid, bool status) external onlyAdmin {
        require(maids[maid].exists, "Maid not found");
        maids[maid].verified = status;
        emit MaidVerified(maid, status);
    }

    // --------------------
    // Job Functions
    // --------------------
    function createJob(address maid, string calldata ipfsHash) external payable {
        require(maids[maid].exists && maids[maid].verified, "Maid not verified");
        require(msg.value > 0, "Deposit required");
        require(bytes(ipfsHash).length > 0, "IPFS hash required");
        require(maid != msg.sender, "Employer and Maid cannot be same");

        jobCount++;
        jobs[jobCount] = Job({
            jobId: jobCount,
            ipfsHash: ipfsHash,
            maid: maid,
            employer: msg.sender,
            status: JobStatus.Active,
            amount: msg.value,
            employerMarked: false,
            maidConfirmed: false,
            createAt: block.timestamp,
            updatedAt: block.timestamp
        });

        emit JobCreated(jobCount, maid, msg.sender, msg.value, block.timestamp);
    }

    function employerConfirmJob(uint jobId) external onlyEmployer(jobId) {
        Job storage job = jobs[jobId];
        require(job.status == JobStatus.Active, "Job not active");
        require(!job.employerMarked, "Already marked");

        job.employerMarked = true;
        job.updatedAt = block.timestamp;

        emit EmployerMarked(jobId, msg.sender, job.updatedAt);
    }

    function maidConfirmJob(uint jobId) external onlyMaid(jobId) {
        Job storage job = jobs[jobId];
        require(job.status == JobStatus.Active, "Job not active");
        require(job.employerMarked, "Employer not confirmed yet");
        require(!job.maidConfirmed, "Already confirmed");

        job.maidConfirmed = true;
        job.status = JobStatus.Paid;
        job.updatedAt = block.timestamp;

        payable(job.maid).transfer(job.amount);

        emit MaidMarked(jobId, msg.sender, job.updatedAt);
        emit FundReleased(jobId, job.maid, job.amount);
    }

    function cancelJob(uint jobId) external {
        Job storage job = jobs[jobId];
        require(job.status == JobStatus.Active, "Job not active");
        require(
            msg.sender == job.employer || msg.sender == admin,
            "Not authorized"
        );

        job.status = JobStatus.Cancelled;
        job.updatedAt = block.timestamp;

        payable(job.employer).transfer(job.amount);

        emit JobCancelled(jobId, job.updatedAt);
    }

    // --------------------
    // Getter Functions
    // --------------------
    function getMaid(address maid) external view returns (Maid memory) {
        return maids[maid];
    }

    function getJob(uint jobId) external view returns (Job memory) {
        return jobs[jobId];
    }

    function getJobStatus(uint jobId) external view returns (JobStatus) {
        return jobs[jobId].status;
    }

    // --------------------
    // Fallbacks
    // --------------------
    receive() external payable {}
    fallback() external payable {}
}
