package com.repository;

import com.entity.SubgroupMember;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface SubgroupMemberRepository extends JpaRepository<SubgroupMember, Long> {

    List<SubgroupMember> findBySubgroupId(Long subgroupId);

    List<SubgroupMember> findByUserId(Long userId);

    Optional<SubgroupMember> findBySubgroupIdAndUserId(Long subgroupId, Long userId);

    boolean existsBySubgroupIdAndUserId(Long subgroupId, Long userId);
}