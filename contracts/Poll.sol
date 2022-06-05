// SPDX-License-Identifier: UNLICENSED
pragma solidity >=0.8.0 <0.9.0;

contract Poll{
    address public owner;
    constructor()  {
        owner=msg.sender;

         }
   
    struct Candidate{
        string name;
        uint voteCount;
        uint id;
    }
    Candidate[] public candidates;
    mapping (address=>bool) public voted;
    mapping (string=>Candidate) public namedCandidate;

    bool paused;

    function getCandidates() public view returns(Candidate[] memory){
        return candidates;
    }

    function setPaused() public{
        require(owner==msg.sender,"You are not the owner");
        paused=true;
    }
    function removePaused() public{
        require(owner==msg.sender,"You are not the owner");
        paused=false;
    }

    function vote(string memory _name) public {
        require(!voted[msg.sender], "You have already made a choice");
        require(!paused,"Poll is currently on hold");
        if(namedCandidate[_name].voteCount==0){
        namedCandidate[_name].name=_name;
       candidates.push(namedCandidate[_name]);
       uint id= candidates.length-1;
       candidates[id].id=id;
       namedCandidate[_name].id=id;
       candidates[id].voteCount++;
       namedCandidate[_name].voteCount++;
       voted[msg.sender]=true;

        }
        else{
        namedCandidate[_name].voteCount++;
        candidates[namedCandidate[_name].id].voteCount++;
        voted[msg.sender]=true;
        }
      
            }
    
    function getWinner() public view returns(string memory _winningCandidate){
        uint highestVote;
        for(uint i=0;i<candidates.length;i++){
            if(candidates[i].voteCount>highestVote){
                highestVote = candidates[i].voteCount;
                _winningCandidate=candidates[i].name;
            }
        }


    }

    function getVoteCount(string memory _name) public view returns(uint _voteCount){
        _voteCount=namedCandidate[_name].voteCount;
    }
    
}