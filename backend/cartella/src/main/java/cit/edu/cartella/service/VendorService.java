package cit.edu.cartella.service;

import cit.edu.cartella.entity.Role;
import cit.edu.cartella.entity.User;
import cit.edu.cartella.entity.Vendor;
import cit.edu.cartella.repository.UserRepository;
import cit.edu.cartella.repository.VendorRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class VendorService {

    private final VendorRepository vendorRepository;
    private final UserRepository userRepository;

    @Autowired
    public VendorService(VendorRepository vendorRepository, UserRepository userRepository) {
        this.vendorRepository = vendorRepository;
        this.userRepository = userRepository;
    }

    public Vendor createVendor(Long userId, Vendor vendorDetails) {
        Optional<User> userOptional = userRepository.findById(userId);

        if (userOptional.isEmpty()) {
            throw new RuntimeException("User not found");
        }

        User user = userOptional.get();
        if (!user.getRole().equals(Role.VENDOR)) {  
            throw new RuntimeException("User must have role VENDOR");
        }

        Vendor vendor = new Vendor(user, vendorDetails.getBusinessName(), vendorDetails.getBusinessAddress(), vendorDetails.getBusinessRegistrationNumber());
        return vendorRepository.save(vendor);
    }

    public List<Vendor> getAllVendors() {
        return vendorRepository.findAll();
    }

    public Optional<Vendor> getVendorById(Long vendorId) {
        return vendorRepository.findById(vendorId);
    }

    public Optional<Vendor> getVendorByUserId(Long userId) {
        return vendorRepository.findByUserUserId(userId);
    }

    public Vendor updateVendor(Long vendorId, Vendor vendorDetails) {
        return vendorRepository.findById(vendorId).map(vendor -> {
            vendor.setBusinessName(vendorDetails.getBusinessName());
            vendor.setBusinessAddress(vendorDetails.getBusinessAddress());
            vendor.setBusinessRegistrationNumber(vendorDetails.getBusinessRegistrationNumber());
            return vendorRepository.save(vendor);
        }).orElseThrow(() -> new RuntimeException("Vendor not found"));
    }

    public void deleteVendor(Long vendorId) {
        vendorRepository.deleteById(vendorId);
    }
}
